import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectUser, editUser, cancelEdit, resetPassword, postUser, newUser } from '../actions';

import EditUser from './EditUser';
import UsersList from './UsersList';
import UserBar from './UserBar'
import SearchBar from '../../wire/components/SearchBar';
import SearchResultsInfo from '../../wire/components/SearchResultsInfo';
import { gettext } from '../../utils';

class UsersApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            errors: {},
        };
        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.userToEdit.email) {
            errors.email = ['Please provide email'];
            valid = false;
        }

        this.setState({errors: errors});
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveUser(event);
    }

    render() {
        const progressStyle = {width: '25%'};

        return (
            <div>
                <UserBar
                    onNewUser={this.props.newUser}
                />
                <div className="row">
                    {(this.props.isLoading ?
                        <div className="col d">
                            <div className="progress">
                                <div className="progress-bar" style={progressStyle} />
                            </div>
                        </div>
                        :
                        <div className="col">
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
                        />
                    }
                </div>
            </div>
        );
    }
}

UsersApp.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    userToEdit: PropTypes.object,
    activeUserId: PropTypes.string,
    selectUser: PropTypes.func,
    editUser: PropTypes.func,
    saveUser: PropTypes.func,
    newUser: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalUsers: PropTypes.number,
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
};

const mapStateToProps = (state) => ({
    users: state.users.map((id) => state.usersById[id]),
    userToEdit: state.userToEdit,
    activeUserId: state.activeUserId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalUsers: state.totalUsers,
    companyOptions: state.companyOptions,
    companiesById: state.companiesById,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectUser: (_id) => dispatch(selectUser(_id)),
    editUser: (event) => dispatch(editUser(event)),
    saveUser: (event) => dispatch(postUser(event)),
    newUser: (event) => dispatch(newUser()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    resetPassword: (event) => dispatch(resetPassword(event)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UsersApp);
