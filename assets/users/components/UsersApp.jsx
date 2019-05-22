import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newUser,
    setQuery,
    fetchUsers,
    fetchCompanies,
    setCompany,
} from '../actions';
import Users from './Users';
import ListBar from 'components/ListBar';
import SelectInput from 'components/SelectInput';


class UsersApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return (
            [<ListBar
                key="UserBar"
                onNewItem={this.props.newUser}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchUsers}
                buttonName={gettext('User')}
            >
                <SelectInput
                    name={gettext('Company')}
                    label={''}
                    options={this.props.companies.map(company => ({value: company._id, text: company.name}))}
                    onChange={this.onChange}
                    defaultOption={'All Companies'}
                    className={'form-inline'}
                />
            </ListBar>,
            <Users key="Users" />
            ]
        );
    }

    onChange(selected)
    {
        this.props.setCompany(selected.target.value);
        this.props.fetchUsers();
    }
}

const mapStateToProps = (state) => ({
    companies: state.companies,
});

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
    fetchCompanies: PropTypes.func,
    setCompany: PropTypes.func,
};

const mapDispatchToProps = {
    newUser,
    fetchUsers,
    setQuery,
    fetchCompanies,
    setCompany,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersApp);
