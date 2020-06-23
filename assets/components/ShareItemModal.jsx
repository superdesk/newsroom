
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { omit, get, sortBy } from 'lodash';
import { gettext, toggleValue } from 'utils';
import {submitShareItem} from 'search/actions';
import { submitShareTopic } from 'user-profile/actions';
import { modalFormInvalid, modalFormValid } from 'actions';

import Modal from 'components/Modal';
import SearchBar from 'search/components/SearchBar';

class ShareItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            users: [],
            displayUsers: this.props.data.users,
            items: this.props.data.items
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.users.length) {
            return this.props.submit(!!this.props.data.isTopic, omit(this.state, 'displayUsers'));
        }
    }

    onChangeHandler(field) {
        return (event) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }

    toggleUser(userId, all) {
        let newValue;
        if (all) {
            newValue = this.props.data.users.length === this.state.users.length ? [] :
                this.props.data.users.map((u) => u._id);
        } else {
            newValue = toggleValue(this.state.users, userId);
        }

        this.setState({ users: newValue });

        if (newValue.length === 0) {
            this.props.modalFormInvalid();
        } else {
            this.props.modalFormValid();
        }
    }

    toggleAllUsers() {
        this.toggleUser(null, true);
    }

    getUsers(q) {
        this.setState({
            displayUsers: q ? this.props.data.users.filter((u) =>
                (this.getUserName(u).toLowerCase()).includes(q.toLowerCase())) : this.props.data.users
        });
    }

    getUserName(user) {
        return `${user.first_name} ${user.last_name}`;
    }

    render() {
        const selectAllText = this.props.data.users.length === this.state.users.length ? gettext('Deselect All') :
            gettext('Select All');
        const usersList = sortBy(this.state.displayUsers, 'first_name').map((user, index) => (
            <tr key={index}>
                <td>
                    <input id={user._id} type="checkbox"
                        checked={this.state.users.indexOf(user._id) > -1}
                        onChange={() => this.toggleUser(user._id)} />
                </td>
                <td>
                    <label htmlFor={user._id}>{this.getUserName(user)}</label>
                </td>
            </tr>
        ));

        return (
            <Modal
                onSubmit={this.onSubmit}
                title={gettext('Share Item')}
                onSubmitLabel={gettext('Share')}
                disableButtonOnSubmit >
                <SearchBar
                    fetchItems={this.getUsers}
                    enableQueryAction={false}
                />
                <form onSubmit={this.onSubmit}>
                    <div className="form-group search-user-list">
                        <label htmlFor="users">{gettext('People')}</label>
                        <table className="table">
                            <thead>
                                {usersList.length > 0 && <tr>
                                    <th>
                                        <input id="check-all" type="checkbox"
                                            onChange={() => this.toggleAllUsers()}
                                            checked={this.state.users.length === this.props.data.users.length}
                                        />
                                    </th>
                                    <th>
                                        <label htmlFor="check-all">{selectAllText}</label>
                                    </th>
                                </tr>}
                            </thead>
                            <tbody>
                                {usersList}
                            </tbody>
                        </table>
                    </div>
                    <div className="form-group user-msg">
                        <label htmlFor="message">{gettext('Message')}</label>
                        <textarea className="form-control"
                            id="message"
                            value={this.state.message}
                            onChange={this.onChangeHandler('message')}
                        />
                    </div>
                </form>
            </Modal>
        );
    }
}

ShareItemModal.propTypes = {
    submit: PropTypes.func.isRequired,
    modalFormInvalid: PropTypes.func,
    modalFormValid: PropTypes.func,
    data: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
        users: PropTypes.arrayOf(PropTypes.shape({
            _id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
        })),
        isTopic: PropTypes.bool,
    }),
};

const mapStateToProps = (state) => ({ formValid: get(state, 'modal.formValid') });

const mapDispatchToProps = (dispatch) => ({
    submit: (isFolllowedTopic, data) => isFolllowedTopic ? dispatch(submitShareTopic(data)) : dispatch(submitShareItem(data)),
    modalFormInvalid: () => dispatch(modalFormInvalid()),
    modalFormValid: () => dispatch(modalFormValid()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareItemModal);
