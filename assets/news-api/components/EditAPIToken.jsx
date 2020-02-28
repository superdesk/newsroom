import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {get, cloneDeep} from 'lodash';
import moment from 'moment';

import TextInput from 'components/TextInput';
import ExpiryDateInput from 'components/ExpiryDateInput';
import TextAreaInput from 'components/TextAreaInput';
import CheckboxInput from 'components/CheckboxInput';
import CardEditor from 'components/CardEditor';

import {
    gettext,
    isInPast,
    DEFAULT_TIMEZONE,
    getEndOfDayFromDate,
    convertUtcToTimezone,
    SERVER_DATETIME_FORMAT,
} from '../../utils';
import {getTokenForCompany, generateTokenForCompany, deleteTokenForCompany, updateTokenForCompany} from '../actions';

export default class EditAPIToken extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            token: null,
            loaded: false,
            errors: {},
            creating: false,
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
        this.setState({loaded: false}, () => {
            if (!this.props.companyId) {
                this.setState({
                    loaded: true,
                    token: null,
                    creating: false,
                });
            } else {
                // Retrieve the API Token from the server
                // Then update this component's state with the token
                getTokenForCompany(this.props.companyId)
                    .then((token) => {
                        this.setState({
                            token: token,
                            loaded: true,
                            creating: false,
                        });
                    }, (error) => {
                        if (error.response.status === 404) {
                            this.setState({
                                loaded: true,
                                token: {
                                    company: this.props.companyId,
                                    enabled: true,
                                },
                                creating: true,
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

        if (!value) {
            newState.token.expiry = null;
        } else {
            newState.token.expiry = getEndOfDayFromDate(value, DEFAULT_TIMEZONE)
                .utc()
                .format(SERVER_DATETIME_FORMAT);

            if (isInPast(value)) {
                newState.errors.expiry = gettext('Cannot be in the past');
            } else {
                delete newState.errors.expiry;
            }
        }

        this.setState(newState);
    }

    getExpiryDate() {
        return this.state.token.expiry ? convertUtcToTimezone(this.state.token.expiry, DEFAULT_TIMEZONE)
            .format('YYYY-MM-DD') : this.state.token.expiry;
    }

    saveToken(event) {
        if (event) {
            event.preventDefault();
        }

        if (this.props.onSave) {
            this.props.onSave();
            this.setState({ creating: false });
            return;
        }

        if (this.state.creating) {
            generateTokenForCompany(this.state.token)
                .then((token) => {
                    this.setState({
                        token: {
                            ...this.state.token,
                            token: token,
                        },
                        creating: false,
                    });
                });
        } else {
            updateTokenForCompany(this.state.token)
                .then(() => {
                    this.setState({creating: false});
                });
        }
    }

    editToken(event) {
        if (event) {
            event.preventDefault();
        }
        
        this.setState({creating: false,});

        if (this.props.onCardEdit) {
            this.props.onCardEdit();
        }
    }

    deleteToken(event) {
        if (event) {
            event.preventDefault();
        }

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
                    creating: true
                });
            });
    }

    onEnabledChange(event) {
        if (event) {
            event.preventDefault();
        }
        
        this.setState({
            token: {
                ...this.state.token,
                enabled: event.target.checked,
            }
        });
    }

    getPreviewCardBody() {
        const token = get(this.state, 'token.token', '');
        const expiry = get(this.state, 'token.expiry');
        const expiryString = !expiry ?
            gettext('Never') :
            moment(expiry).format('dddd, DD MMMM YYYY');
        const expiresLabel = isInPast(expiry) ?
            gettext('Expired On:') :
            gettext('Expires On:');

        return (<Fragment>
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

    render() {
        if (this.state.loaded === false) {
            return null;
        }

        const title = !this.state.creating ?
            gettext('Edit API Token') :
            gettext('Create New API Token');
        const previewTitle= !get(this.state, 'token.enabled', false) ? gettext('API Token - Disabled') :
            gettext('API Token');
        const saveText = !this.state.creating ? gettext('Save Token') : gettext('Generate Token');

        return (<CardEditor
            editorTitle={title}
            previewTitle={previewTitle}
            titleClassNames={!get(this.state, 'token.enabled', false) ? 'text-danger' : ''}
            forceEditor={this.state.creating}
            hideCancel={this.state.creating}
            previewCardBody={this.getPreviewCardBody()}
            editorCardBody={this.getEditorCardBody()}
            onSave={this.saveToken}
            onCancel={this.loadToken}
            onEdit={this.editToken}
            onDelete={this.deleteToken}
            previewClassNames='company-api__token-preview'
            editorClassNames='company-api__token-edit'
            saveText={saveText} />);
    }
}

EditAPIToken.propTypes = {
    companyId: PropTypes.string,
    onCardEdit: PropTypes.func,
    onCardPreview: PropTypes.func,
    onSave: PropTypes.func,
    label: PropTypes.string,
    previewCardBody: PropTypes.node,
    editorCardBody: PropTypes.node,
    noDelete: PropTypes.bool,
};
