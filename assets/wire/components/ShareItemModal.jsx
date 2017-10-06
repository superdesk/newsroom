
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext, toggleValue } from 'utils';
import { closeModal, submitShareItem } from 'wire/actions';

import Modal, { ModalPrimaryButton, ModalSecondaryButton } from 'components/Modal';
import CloseButton from 'components/CloseButton';

class ShareItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: '', users: [], items: this.props.data.items};
        this.onSubmit = this.onSubmit.bind(this);
        this.users = this.props.data.users;
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.users.length) {
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

    toggleUser(userId) {
        this.setState({
            users: toggleValue(this.state.users, userId),
        });
    }

    toggleAllUsers() {
        this.setState({
            users: this.users.length === this.state.users.length ? [] : this.users.map((u) => u._id),
        });
    }

    render() {
        const usersList = this.users.map((user) => (
            <tr key={user._id}>
                <td>
                    <input id={user._id} type="checkbox"
                        checked={this.state.users.indexOf(user._id) > -1}
                        onChange={() => this.toggleUser(user._id)} />
                </td>
                <td>
                    <label htmlFor={user._id}>{user.first_name} {' '} {user.last_name}</label>
                </td>
            </tr>
        ));

        return (
            <Modal onClose={this.props.closeModal}>
                <CloseButton onClick={this.props.closeModal} />
                <h1>{gettext('Share Item')}</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="users">{gettext('People')}</label>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <input id="check-all" type="checkbox"
                                            onChange={() => this.toggleAllUsers()}
                                            checked={this.state.users.length === this.users.length}
                                        />
                                    </th>
                                    <th>
                                        <label htmlFor="check-all">{gettext('Select All')}</label>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList}
                            </tbody>
                        </table>
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">{gettext('Message')}</label>
                        <textarea className="form-control"
                            id="message"
                            value={this.state.message}
                            onChange={this.onChangeHandler('message')}
                        />
                    </div>
                    <ModalSecondaryButton
                        onClick={this.props.closeModal}
                        label={gettext('Cancel')}
                    />
                    {' '}
                    <ModalPrimaryButton
                        type="submit"
                        label={gettext('Share')}
                    />
                </form>
            </Modal>
        );
    }
}

ShareItemModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    data: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
        users: PropTypes.arrayOf(PropTypes.shape({
            _id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
        })),
    })
};

const mapDispatchToProps = (dispatch) => ({
    closeModal: () => dispatch(closeModal()),
    submit: (data) => dispatch(submitShareItem(data)),
});

export default connect(null, mapDispatchToProps)(ShareItemModal);
