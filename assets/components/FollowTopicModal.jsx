import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';

import { gettext } from 'utils';
import { submitFollowTopic as submitWireFollowTopic } from 'wire/actions';
import { submitFollowTopic as submitProfileFollowTopic } from 'user-profile/actions';
import { modalFormInvalid, modalFormValid } from 'actions';

import Modal from './Modal';
import TextInput from './TextInput';
import CheckboxInput from './CheckboxInput';

const TOPIC_NAME_MAXLENGTH = 30;

class FollowTopicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topic: this.props.data.topic || null,
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.toggleNotifications = this.toggleNotifications.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.topic.label) {
            this.props.submit(this.isNewTopic(), this.state.topic);
        }
    }

    updateFormValidity(topic) {
        const original = get(this.props, 'data.topic') || {};

        if (!topic.label) {
            // The topic must have a label so disable the save button
            this.props.modalFormInvalid();
        } else if (original.label !== topic.label || original.notifications !== topic.notifications) {
            // If the label or notification have changed, then enable the save button
            this.props.modalFormValid();
        } else {
            // Otherwise the form is not dirty
            this.props.modalFormInvalid();
        }
    }

    onChangeHandler(field) {
        return (event) => {
            const topic = Object.assign({}, this.state.topic, {[field]: event.target.value});
            this.setState({topic});
            this.updateFormValidity(topic);
        };
    }

    toggleNotifications() {
        const topic = Object.assign({}, this.state.topic, {notifications: !this.state.topic.notifications});
        this.setState({topic});
        this.updateFormValidity(topic);
    }

    isNewTopic() {
        return this.state.topic && !this.state.topic._id;
    }

    getTitle() {
        return this.state.topic && this.state.topic.topic_type === 'agenda' ?
            gettext('Save event search') : gettext('Save as topic');
    }

    render() {
        return (
            <Modal title={this.getTitle()} onSubmit={this.onSubmit}>
                <form onSubmit={this.onSubmit}>
                    <TextInput
                        label={gettext('Name')}
                        required={true}
                        value={this.state.topic.label}
                        onChange={this.onChangeHandler('label')}
                        maxLength={TOPIC_NAME_MAXLENGTH}
                    />
                    <CheckboxInput
                        label={gettext('Send me notifications')}
                        value={this.state.topic.notifications || false}
                        onChange={this.toggleNotifications}
                    />
                </form>
            </Modal>
        );
    }
}

FollowTopicModal.propTypes = {
    submit: PropTypes.func.isRequired,
    data: PropTypes.shape({
        topic: PropTypes.object.isRequired,
    }),
    modalFormInvalid: PropTypes.func,
    modalFormValid: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
    submit: (isNew, data) => isNew ? dispatch(submitWireFollowTopic(data)) : dispatch(submitProfileFollowTopic(data)),
    modalFormInvalid: () => dispatch(modalFormInvalid()),
    modalFormValid: () => dispatch(modalFormValid()),
});

export default connect(null, mapDispatchToProps)(FollowTopicModal);