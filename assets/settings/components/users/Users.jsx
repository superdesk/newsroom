import React from 'react';
import PropTypes from 'prop-types';
import EditUser from './EditUser';
import UsersList from './UsersList';
import SearchResultsInfo from 'wire/components/SearchResultsInfo';
import {setError} from 'settings/actions';
import {gettext} from 'utils';

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
                    <div className="flex-col">
                        {this.props.activeQuery &&
                        <SearchResultsInfo
                            totalItems={this.props.totalUsers}
                            query={this.props.activeQuery} />
                        }
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
                        companies={this.props.companyOptions}
                        onSave={this.save}
                        onResetPassword={this.props.resetPassword}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteUser}
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
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

export default Users;
