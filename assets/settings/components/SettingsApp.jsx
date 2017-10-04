import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    selectItem,
    editItem,
    cancelEdit,
    resetPassword,
    postItem,
    deleteItem,
    newItem,
    updateMenu,
    fetchItems,
    fetchCompanyUsers,
} from '../actions';
import UserBar from './users/UserBar';
import Users from './users/Users';
import SettingsMenu from './SettingsMenu';
import Companies from './companies/Companies';
import CompanyBar from './companies/CompanyBar';

class SettingsApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            errors: {},
        };
    }

    render() {
        return (
            <div className="row">
                <div className='col-2' id='settings-menu'>
                    <SettingsMenu
                        onClick={this.props.selectMenu}
                        isCompanySettings={this.props.selectedMenu === 'companies'}
                        isUserSettings={this.props.selectedMenu === 'users'}
                        isSystemSettings={this.props.selectedMenu === 'system'}
                    />
                </div>
                {this.props.selectedMenu === 'users' ?
                    <div className="col">
                        <UserBar
                            onNewUser={this.props.newItem}
                            fetchItems={this.props.fetchItems}
                        />
                        <Users
                            users={this.props.items}
                            userToEdit={this.props.itemToEdit}
                            activeUserId={this.props.activeItemId}
                            selectUser={this.props.selectItem}
                            editUser={this.props.editItem}
                            saveUser={this.props.saveItem}
                            newUser={this.props.newItem}
                            deleteUser={this.props.deleteItem}
                            resetPassword={this.props.resetPassword}
                            cancelEdit={this.props.cancelEdit}
                            isLoading={this.props.isLoading}
                            activeQuery={this.props.activeQuery}
                            totalUsers={this.props.totalItems}
                            companyOptions={this.props.companyOptions}
                            companiesById={this.props.companiesById}
                            errors={this.props.errors}
                        />
                    </div> : null }
                {this.props.selectedMenu === 'companies' ?
                    <div className="col">
                        <CompanyBar
                            onNewCompany={this.props.newItem}
                            fetchItems={this.props.fetchItems}
                        />
                        <Companies
                            companies={this.props.items}
                            companyToEdit={this.props.itemToEdit}
                            companyUsers={this.props.companyUsers}
                            activeCompanyId={this.props.activeItemId}
                            selectCompany={this.props.selectItem}
                            editCompany={this.props.editItem}
                            saveCompany={this.props.saveItem}
                            deleteCompany={this.props.deleteItem}
                            newCompany={this.props.newItem}
                            cancelEdit={this.props.cancelEdit}
                            isLoading={this.props.isLoading}
                            activeQuery={this.props.activeQuery}
                            totalCompanies={this.props.totalItems}
                            errors={this.props.errors}
                            fetchCompanyUsers={this.props.fetchCompanyUsers}
                        />
                    </div> : null }
            </div>

        );
    }
}

SettingsApp.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    itemToEdit: PropTypes.object,
    activeItemId: PropTypes.string,
    selectItem: PropTypes.func,
    editItem: PropTypes.func,
    saveItem: PropTypes.func,
    deleteItem: PropTypes.func,
    newItem: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalItems: PropTypes.number,
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    companyUsers: PropTypes.arrayOf(PropTypes.object),
    errors: PropTypes.object,
    selectMenu: PropTypes.func,
    selectedMenu: PropTypes.string,
    fetchItems: PropTypes.func,
    fetchCompanyUsers: PropTypes.func,
};

const mapStateToProps = (state) => ({
    items: state.items.map((id) => state.itemsById[id]),
    itemToEdit: state.itemToEdit,
    activeItemId: state.activeItemId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalItems: state.totalItems,
    companyOptions: state.companyOptions,
    companiesById: state.companiesById,
    companyUsers: state.companyUsers,
    selectedMenu: state.selectedMenu,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectItem: (_id) => dispatch(selectItem(_id)),
    editItem: (event) => dispatch(editItem(event)),
    saveItem: (type) => dispatch(postItem(type)),
    deleteItem: (type) => dispatch(deleteItem(type)),
    newItem: (data) => dispatch(newItem(data)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    resetPassword: () => dispatch(resetPassword()),
    selectMenu: (event) => dispatch(updateMenu(event)),
    fetchItems: (type) => dispatch(fetchItems(type)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsApp);
