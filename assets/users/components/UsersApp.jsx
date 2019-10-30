import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get} from 'lodash';
import {connect} from 'react-redux';

import {gettext} from 'utils';

import {
    newUser,
    fetchUsers,
    fetchCompanies,
    setCompany,
    setSort,
    toggleSortDirection,
} from '../actions';
import {setSearchQuery} from 'search/actions';

import Users from './Users';
import ListBar from 'components/ListBar';
import DropdownFilter from 'components/DropdownFilter';


class UsersApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onChange = this.onChange.bind(this);
        this.onSortChanged = this.onSortChanged.bind(this);
        this.filters = [{
            label: gettext('All Companies'),
            field: 'company'
        },
        {
            label: gettext('Sort By'),
            field: 'sort'
        }];
        this.getDropdownItems = this.getDropdownItems.bind(this);
        this.sortFields = [{
            _id: 'last_active',
            name: 'Last Active'
        },
        {
            _id: 'user_type',
            name: 'User Type'
        },
        {
            _id: 'is_enabled',
            name: 'Status'
        }];
    }

    getDropdownItems(filter) {
        return (filter.field === 'company' ? this.props.companies : this.sortFields).map((item, i) => (<button
            key={i}
            className='dropdown-item'
            onClick={() => {this.onChange(filter.field, item._id);}}
        >{item.name}</button>));
    }

    getActiveQuery() {
        return {
            sort: this.props.sort ? [get(this.sortFields.find((s) => s._id === this.props.sort), 'name')] : null,
            company: this.props.company ? [get(this.props.companies.find((c) => c._id === this.props.company), 'name')] :
                null,
        };
    }

    render() {
        const activeQuery = this.getActiveQuery();
        return (
            [<ListBar
                key="UserBar"
                onNewItem={this.props.newUser}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchUsers}
                buttonName={gettext('User')}
            >
                <DropdownFilter
                    key={this.filters[0].label}
                    filter={this.filters[0]}
                    getDropdownItems={this.getDropdownItems}
                    activeFilter={activeQuery}
                    toggleFilter={this.onChange}
                />
                <DropdownFilter
                    key={this.filters[1].label}
                    filter={this.filters[1]}
                    getDropdownItems={this.getDropdownItems}
                    activeFilter={activeQuery}
                    toggleFilter={this.onChange}
                />
                {this.props.sort && <button className="btn btn-outline-primary btn-sm d-flex"
                    onClick={this.onSortChanged}>
                    <i className={classNames('icon-small--arrow-down',
                        {'rotate-180': this.props.sortDirection === -1})} /></button>}
            </ListBar>,
            <Users key="Users" />
            ]
        );
    }

    onChange(field, value)
    {
        if (field === 'company') {
            this.props.setCompany(value);
        } else {
            this.props.setSort(value);
        }

        this.props.fetchUsers();
    }

    onSortChanged() {
        this.props.toggleSortDirection();
        this.props.fetchUsers();
    }
}

const mapStateToProps = (state) => ({
    companies: state.companies,
    company: state.company,
    sort: state.sort,
    sortDirection: state.sortDirection
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
    company: PropTypes.string,
    sort: PropTypes.string,
    sortDirection:PropTypes.number,
    setSort: PropTypes.func,
    toggleSortDirection: PropTypes.func,

};

const mapDispatchToProps = {
    newUser,
    fetchUsers,
    setQuery: setSearchQuery,
    fetchCompanies,
    setCompany,
    setSort,
    toggleSortDirection,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersApp);
