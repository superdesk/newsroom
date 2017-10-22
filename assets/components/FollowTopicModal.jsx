import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

import Modal, { ModalPrimaryButton, ModalSecondaryButton } from './Modal';
import CloseButton from './CloseButton';
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
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.topic.label) {
            this.props.submit(this.state.topic);
        }
    }

    onChangeHandler(field) {
        return (event) => {
            const topic = Object.assign(this.state.topic, {[field]: event.target.value});
            this.setState({topic});
        };
    }

    toggleNotifications() {
        const topic = Object.assign(this.state.topic, {notifications: !this.state.topic.notifications});
        this.setState({topic});
    }

    render() {
        return (
            <Modal onClose={this.props.closeModal}>
                <CloseButton onClick={this.props.closeModal} />
                <h1>{gettext('Follow topic')}</h1>
                <form onSubmit={this.onSubmit}>
                    <TextInput
                        label={gettext('Name')}
                        required={true}
                        value={this.state.topic.label}
                        onChange={this.onChangeHandler('label')}
                        maxLength={TOPIC_NAME_MAXLENGTH}
                    />
                    <TextInput
                        label={gettext('Query')}
                        value={this.state.topic.query}
                        onChange={this.onChangeHandler('query')}
                        readOnly={!this.props.isEditable}
                    />
                    <CheckboxInput
                        label={gettext('Send me notifications')}
                        value={this.state.topic.notifications || false}
                        onChange={() => this.toggleNotifications()}
                    />
                    <ModalSecondaryButton
                        onClick={this.props.closeModal}
                        label={gettext('Cancel')}
                    />
                    {' '}
                    <ModalPrimaryButton
                        type="submit"
                        label={gettext('Save')}
                    />
                </form>
            </Modal>
        );
    }
}

FollowTopicModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    data: PropTypes.shape({
        topic: PropTypes.object.isRequired,
    }),
    isEditable: PropTypes.bool.isRequired,
};

export default FollowTopicModal;
