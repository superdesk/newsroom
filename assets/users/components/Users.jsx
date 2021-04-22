import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {gettext} from 'utils';

import {
    deleteUser,
    editUser,
    newUser,
    postUser,
    resetPassword,
    selectUser,
    setError,
    cancelEdit
} from '../actions';
import {searchQuerySelector} from 'search/selectors';
import {userSelector} from '../selectors';

import EditUser from './EditUser';
import UsersList from './UsersList';
import SearchResults from 'search/components/SearchResults';


class Users extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.userToEdit.email) {
            errors.email = ['Please provide email'];
            valid = false;
        }

        this.props.dispatch(setError(errors));
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveUser('users');
    }

    deleteUser(event) {
        event.preventDefault();

        confirm(gettext('Would you like to delete user: {{name}}?', {name: this.props.userToEdit.first_name})) &&
            this.props.deleteUser('users');
    }

    render() {
        const progressStyle = {width: '25%'};

        return (
            <div className="flex-row">
                {(this.props.isLoading ?
                    <div className="col d">
                        <div className="progress">
                            <div className="progress-bar" style={progressStyle} />
                        </div>
                    </div>
                    :
                    <div className="flex-col flex-column">
                        {this.props.activeQuery && (
                            <SearchResults
                                showTotalItems={true}
                                showTotalLabel={true}
                                showSaveTopic={false}
                                totalItems={this.props.totalUsers}
                                totalItemsLabel={this.props.activeQuery}
                            />
                        )}
                        <UsersList
                            users={this.props.users}
                            onClick={this.props.selectUser}
                            activeUserId={this.props.activeUserId}
                            companiesById={this.props.companiesById}/>
                    </div>
                )}
                {this.props.userToEdit &&
                    <EditUser
                        user={this.props.userToEdit}
                        onChange={this.props.editUser}
                        errors={this.props.errors}
                        companies={this.props.companies}
                        onSave={this.save}
                        onResetPassword={this.props.resetPassword}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteUser}
                        currentUser={this.props.currentUser}
                    />
                }
            </div>
        );
    }
}

Users.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    userToEdit: PropTypes.object,
    activeUserId: PropTypes.string,
    selectUser: PropTypes.func,
    editUser: PropTypes.func,
    saveUser: PropTypes.func,
    newUser: PropTypes.func,
    deleteUser: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalUsers: PropTypes.number,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    currentUser: PropTypes.object,
};

const mapStateToProps = (state) => ({
    users: state.users.map((id) => state.usersById[id]),
    userToEdit: state.userToEdit,
    activeUserId: state.activeUserId,
    isLoading: state.isLoading,
    activeQuery: searchQuerySelector(state),
    totalUsers: state.totalUsers,
    companies: state.companies,
    companiesById: state.companiesById,
    errors: state.errors,
    currentUser: userSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    selectUser: (_id) => dispatch(selectUser(_id)),
    editUser: (event) => dispatch(editUser(event)),
    saveUser: (type) => dispatch(postUser(type)),
    deleteUser: (type) => dispatch(deleteUser(type)),
    newUser: (data) => dispatch(newUser(data)),
    resetPassword: () => dispatch(resetPassword()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Users);
