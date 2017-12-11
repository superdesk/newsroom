import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    selectUser,
    editUser,
    cancelEdit,
    postUser,
    deleteUser,
    newUser,
    resetPassword,
    setQuery, fetchUsers,
} from '../actions';
import Users from './Users';
import ListBar from 'components/ListBar';


class UsersApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="UserBar"
                onNewItem={this.props.newUser}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchUsers}
                buttonName={'User'}
            />,
            <Users
                key="Users"
                users={this.props.users}
                userToEdit={this.props.userToEdit}
                activeUserId={this.props.activeUserId}
                selectUser={this.props.selectUser}
                editUser={this.props.editUser}
                saveUser={this.props.saveUser}
                deleteUser={this.props.deleteUser}
                resetPassword={this.props.resetPassword}
                newUser={this.props.newUser}
                cancelEdit={this.props.cancelEdit}
                isLoading={this.props.isLoading}
                activeQuery={this.props.activeQuery}
                totalUsers={this.props.totalUsers}
                companies={this.props.companies}
                companiesById={this.props.companiesById}
                errors={this.props.errors}
                dispatch={this.props.dispatch}

            />]
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
    deleteUser: PropTypes.func,
    newUser: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalUsers: PropTypes.number,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    usersById: PropTypes.object,
    fetchUsers: PropTypes.func,
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

const mapStateToProps = (state) => ({
    users: state.users.map((id) => state.usersById[id]),
    userToEdit: state.userToEdit,
    activeUserId: state.activeUserId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalUsers: state.totalUsers,
    companies: state.companies,
    companiesById: state.companiesById,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectUser: (_id) => dispatch(selectUser(_id)),
    editUser: (event) => dispatch(editUser(event)),
    saveUser: (type) => dispatch(postUser(type)),
    deleteUser: (type) => dispatch(deleteUser(type)),
    newUser: (data) => dispatch(newUser(data)),
    fetchUsers: () => dispatch(fetchUsers()),
    setQuery: (query) => dispatch(setQuery(query)),
    resetPassword: () => dispatch(resetPassword()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(UsersApp);
