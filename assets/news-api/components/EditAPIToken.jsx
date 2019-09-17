import React from 'react';
import PropTypes from 'prop-types';
import {get, cloneDeep} from 'lodash';
import moment from 'moment';

import TextInput from 'components/TextInput';
import ExpiryDateInput from 'components/ExpiryDateInput';
import TextAreaInput from 'components/TextAreaInput';
import CheckboxInput from 'components/CheckboxInput';

import {gettext, getDateInputDate, isInPast} from '../../utils';
import {getTokenForCompany, generateTokenForCompany, deleteTokenForCompany, updateTokenForCompany} from '../actions';

const EDITOR_ACTIONS = {
    NONE: null,
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    PREVIEW: 'PREVIEW',
};

export default class EditAPIToken extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            token: null,
            loaded: false,
            errors: {},
            action: EDITOR_ACTIONS.NONE,
        };

        this.onExpiryChange = this.onExpiryChange.bind(this);
        this.saveToken = this.saveToken.bind(this);
        this.editToken = this.editToken.bind(this);
        this.deleteToken = this.deleteToken.bind(this);
        this.loadToken = this.loadToken.bind(this);
        this.onEnabledChange = this.onEnabledChange.bind(this);
    }

    componentDidMount() {
        this.loadToken();
    }

    loadToken() {
        this.setState({loaded: false}, () => {
            if (!this.props.companyId) {
                this.setState({
                    loaded: true,
                    token: null,
                    action: EDITOR_ACTIONS.NONE,
                });
            } else {
                // Retrieve the API Token from the server
                // Then update this component's state with the token
                getTokenForCompany(this.props.companyId)
                    .then((token) => {
                        this.setState({
                            token: token,
                            loaded: true,
                            action: EDITOR_ACTIONS.PREVIEW,
                        });
                    }, (error) => {
                        if (error.response.status === 404) {
                            this.setState({
                                loaded: true,
                                token: {
                                    company: this.props.companyId,
                                    enabled: true,
                                },
                                action: EDITOR_ACTIONS.CREATE,
                            });
                        } else {
                            throw error;
                        }
                    });
            }
        });
    }

    componentDidUpdate(prevProps) {
        // reset tabs when new company is created
        if (this.props.companyId !== prevProps.companyId) {
            this.loadToken();
        }
    }

    onExpiryChange(value) {
        const newState = cloneDeep(this.state);

        newState.token.expiry = value;

        if (isInPast(value)) {
            newState.errors.expiry = gettext('Cannot be in the past');
        } else {
            delete newState.errors.expiry;
        }

        this.setState(newState);
    }

    saveToken(event) {
        event.preventDefault();

        if (get(this.state, 'action') === EDITOR_ACTIONS.CREATE) {
            generateTokenForCompany(this.state.token)
                .then((token) => {
                    this.setState({
                        token: {
                            ...this.state.token,
                            token: token,
                        },
                        action: EDITOR_ACTIONS.PREVIEW,
                    });
                });
        } else {
            updateTokenForCompany(this.state.token)
                .then(() => {
                    this.setState({action: EDITOR_ACTIONS.PREVIEW});
                });
        }
    }

    editToken(event) {
        event.preventDefault();
        this.setState({action: EDITOR_ACTIONS.UPDATE});
    }

    deleteToken(event) {
        event.preventDefault();

        if (!confirm(gettext('Are you sure you want to delete this Company\'s API Token?'))) {
            return;
        }

        deleteTokenForCompany(this.props.companyId)
            .then(() => {
                this.setState({
                    token: {
                        company: this.props.companyId,
                        enabled: true,
                    },
                    action: EDITOR_ACTIONS.CREATE,
                });
            });
    }

    onEnabledChange(event) {
        this.setState({
            token: {
                ...this.state.token,
                enabled: event.target.checked,
            }
        });
    }

    renderEditor() {
        const existing = get(this.state, 'action') === EDITOR_ACTIONS.UPDATE;
        const title = existing ?
            gettext('Edit API Token') :
            gettext('Create New API Token');

        return (
            <div className='tab-pane active company-api__token-edit' id='company-api-token'>
                <form onSubmit={(event) => {event.preventDefault();}}>
                    <div className="list-item__preview-form">
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex flex-row">{title}</div>
                            <div className="card-body">
                                <ExpiryDateInput
                                    name="expiry"
                                    label={gettext('Expires:')}
                                    value={getDateInputDate(this.state.token.expiry)}
                                    onChange={this.onExpiryChange}
                                    error={get(this.state, 'errors.expiry')}
                                />

                                <CheckboxInput
                                    name='is_enabled'
                                    label={gettext('Enabled')}
                                    value={this.state.token.enabled}
                                    onChange={this.onEnabledChange}
                                />
                            </div>
                            <div className="card-footer d-flex">
                                <button
                                    className="btn btn-outline-primary ml-auto"
                                    onClick={this.saveToken}
                                    disabled={Object.keys(this.state.errors).length > 0}
                                >
                                    {existing ? gettext('Save') : gettext('Generate Token')}
                                </button>
                                {existing && (
                                    <button
                                        className='btn btn-outline-secondary ml-3'
                                        onClick={this.loadToken}
                                    >
                                        {gettext('Cancel')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    renderPreview() {
        const expiry = get(this.state, 'token.expiry');
        const expiryString = !expiry ?
            gettext('Never') :
            moment(expiry).format('dddd, DD MMMM YYYY');
        const token = get(this.state, 'token.token', '');
        const expiresLabel = isInPast(expiry) ?
            gettext('Expired On:') :
            gettext('Expires On:');

        return (
            <div className='tab-pane active company-api__token-preview' id='company-api-token'>
                <form onSubmit={this.onSubmit}>
                    <div className="list-item__preview-form" key='api-token'>
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex justify-content-start align-items-center">
                                {!get(this.state, 'token.enabled', false) ? (
                                    <span className="text-danger">{gettext('API Token - Disabled')}</span>
                                ) : (
                                    <span>{gettext('API Token')}</span>
                                )}
                                <button className="icon-button ml-auto" onClick={this.editToken}>
                                    <i className="icon--edit" />
                                </button>
                                <button className="icon-button" onClick={this.deleteToken}>
                                    <i className="icon--trash" />
                                </button>
                            </div>
                            <div className="card-body">
                                <TextInput
                                    name='expiry'
                                    label={expiresLabel}
                                    value={expiryString}
                                    readOnly={true}
                                />
                                <TextAreaInput
                                    name='token'
                                    label={gettext('Token:')}
                                    value={token}
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    render() {
        if (this.state.loaded === false) {
            return null;
        }

        switch (this.state.action) {
        case EDITOR_ACTIONS.CREATE:
        case EDITOR_ACTIONS.UPDATE:
            return this.renderEditor();
        case EDITOR_ACTIONS.PREVIEW:
            return this.renderPreview();
        }

        return null;
    }
}

EditAPIToken.propTypes = {companyId: PropTypes.string.isRequired};
