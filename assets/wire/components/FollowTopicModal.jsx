import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { closeModal, submitFollowTopic } from 'wire/actions';

import Modal, { ModalPrimaryButton, ModalSecondaryButton } from 'components/Modal';
import CloseButton from 'components/CloseButton';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';

const TOPIC_NAME_MAXLENGTH = 30;

class FollowTopicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.data.topic,
            label: '',
            notifications: false,
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.label) {
            this.props.submit(this.state);
        }
    }

    onChangeHandler(field) {
        return (event) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }

    toggleNotifications() {
        this.setState({notifications: !this.state.notifications});
    }

    render() {
        return (
            <Modal onClose={closeModal}>
                <CloseButton onClick={this.props.closeModal} />
                <h1>{gettext('Follow topic')}</h1>
                <form onSubmit={this.onSubmit}>
                    <TextInput
                        label={gettext('Name')}
                        required={true}
                        value={this.state.label}
                        onChange={this.onChangeHandler('label')}
                        maxLength={TOPIC_NAME_MAXLENGTH}
                    />
                    <TextInput
                        label={gettext('Query')}
                        value={this.state.query}
                        readOnly={true}
                    />
                    <CheckboxInput
                        label={gettext('Send me notifications')}
                        value={this.state.notifications}
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
        topic: PropTypes.string.isRequired,
    }),
};

const mapDispatchToProps = (dispatch) => ({
    closeModal: () => dispatch(closeModal()),
    submit: (data) => dispatch(submitFollowTopic(data)),
});

export default connect(null, mapDispatchToProps)(FollowTopicModal);
