import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {get, cloneDeep} from 'lodash';
import moment from 'moment';

import TextInput from 'components/TextInput';
import ExpiryDateInput from 'components/ExpiryDateInput';
import TextAreaInput from 'components/TextAreaInput';
import CheckboxInput from 'components/CheckboxInput';

import {
    gettext,
    isInPast,
    DEFAULT_TIMEZONE,
    getEndOfDayFromDate,
    convertUtcToTimezone,
    SERVER_DATETIME_FORMAT,
} from '../../utils';
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
        this.getExpiryDate = this.getExpiryDate.bind(this);
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
        if (this.props.disableToken) {
            this.setState({ action: EDITOR_ACTIONS.PREVIEW });
            if (this.props.onCardPreview) {
                this.props.onCardPreview();
            }
            return;
        }

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

        newState.token.expiry = getEndOfDayFromDate(value, DEFAULT_TIMEZONE)
            .utc()
            .format(SERVER_DATETIME_FORMAT);

        if (isInPast(value)) {
            newState.errors.expiry = gettext('Cannot be in the past');
        } else {
            delete newState.errors.expiry;
        }

        this.setState(newState);
    }

    getExpiryDate() {
        return convertUtcToTimezone(this.state.token.expiry, DEFAULT_TIMEZONE)
            .format('YYYY-MM-DD');
    }

    saveToken(event) {
        event.preventDefault();
        if (this.props.onSave) {
            this.props.onSave();
            this.setState({ action: EDITOR_ACTIONS.PREVIEW });
            return;
        }

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

        if (this.props.onCardEdit) {
            this.props.onCardEdit();
        }
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

    getPreviewCardBody() {
        let elem = this.props.previewCardBody;
        if (!elem) {
            const token = get(this.state, 'token.token', '');
            const expiry = get(this.state, 'token.expiry');
            const expiryString = !expiry ?
                gettext('Never') :
                moment(expiry).format('dddd, DD MMMM YYYY');
            const expiresLabel = isInPast(expiry) ?
                gettext('Expired On:') :
                gettext('Expires On:');

            elem = (<Fragment>
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
            </Fragment>);
        }

        return (<div className="card-body">{elem}</div>);
    }

    getEditorCardBody() {
        const elem = this.props.editorCardBody ? this.props.editorCardBody :
            (<Fragment>
                <ExpiryDateInput
                    name="expiry"
                    label={gettext('Expires:')}
                    value={this.getExpiryDate()}
                    onChange={this.onExpiryChange}
                    error={get(this.state, 'errors.expiry')}
                />
                <CheckboxInput
                    name='is_enabled'
                    label={gettext('Enabled')}
                    value={this.state.token.enabled}
                    onChange={this.onEnabledChange}
                />
            </Fragment>);

        return (<div className="card-body">{elem}</div>);
    }

    renderEditor() {
        const existing = get(this.state, 'action') === EDITOR_ACTIONS.UPDATE;
        const title = existing ?
            gettext('Edit API Token') :
            gettext('Create New API Token');
        const saveText = this.props.disableToken ? gettext('Save') : '';

        return (
            <div className='tab-pane active company-api__token-edit' id='company-api-token'>
                <form onSubmit={(event) => {event.preventDefault();}}>
                    <div className="list-item__preview-form pb-0 pt-0">
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex flex-row">{this.props.label || title}</div>
                            {this.getEditorCardBody()}
                            <div className="card-footer d-flex">
                                <button
                                    className="btn btn-outline-primary ml-auto"
                                    onClick={this.saveToken}
                                    disabled={Object.keys(this.state.errors).length > 0}
                                >
                                    {saveText || (existing ? gettext('Save Token') : gettext('Generate Token'))}
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
        let title;

        if(this.props.label) {
            title = (<span>{this.props.label}</span>);
        } else {
            title = !get(this.state, 'token.enabled', false) ? (
                <span className="text-danger">{gettext('API Token - Disabled')}</span>
            ) : (
                <span>{gettext('API Token')}</span>
            );
        }

        return (
            <div className='tab-pane active company-api__token-preview' id='company-api-token'>
                <form onSubmit={this.onSubmit}>
                    <div className="list-item__preview-form  pb-0 pt-0" key='api-token'>
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex justify-content-start align-items-center">
                                {title}
                                <button className="icon-button ml-auto" onClick={this.editToken}>
                                    <i className="icon--edit" />
                                </button>
                                {!this.props.noDelete && <button className="icon-button" onClick={this.deleteToken}>
                                    <i className="icon--trash" />
                                </button>}
                            </div>
                            {this.getPreviewCardBody()}
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    render() {
        if (this.state.loaded === false && !this.props.disableToken) {
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

EditAPIToken.propTypes = {
    companyId: PropTypes.string,
    disableToken: PropTypes.bool,
    onCardEdit: PropTypes.func,
    onCardPreview: PropTypes.func,
    onSave: PropTypes.func,
    label: PropTypes.string,
    previewCardBody: PropTypes.node,
    editorCardBody: PropTypes.node,
    noDelete: PropTypes.bool,
};
