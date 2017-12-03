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
    newProduct,
    updateMenu,
    fetchItems,
    fetchProducts,
    fetchCompanyUsers,
} from '../actions';
import UserBar from './users/UserBar';
import Users from './users/Users';
import SettingsMenu from './SettingsMenu';
import Companies from './companies/Companies';
import CompanyBar from './companies/CompanyBar';
import ProductBar from './products/ProductBar'
import Products from './products/Products'

class SettingsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="settings-inner">
                <div className='side-navigation' id='settings-menu'>
                    <SettingsMenu
                        onClick={this.props.selectMenu}
                        isCompanySettings={this.props.selectedMenu === 'companies'}
                        isUserSettings={this.props.selectedMenu === 'users'}
                        isProducts={this.props.selectedMenu === 'products'}
                        isSystemSettings={this.props.selectedMenu === 'system'}
                    />
                </div>
                {this.props.selectedMenu === 'users' ?
                    <div className="content">
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
                            dispatch={this.props.dispatch}

                        />
                    </div> : null }
                {this.props.selectedMenu === 'companies' ?
                    <div className="content">
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
                            fetchCompanyUsers={this.props.fetchCompanyUsers}
                            errors={this.props.errors}
                            dispatch={this.props.dispatch}

                        />
                    </div> : null }
                {this.props.selectedMenu === 'products' ?
                    <div className="content">
                        <ProductBar
                            onNewProduct={this.props.newProduct}
                            fetchItems={this.props.fetchItems}
                        />
                        <Products
                            products={this.props.items}
                            productToEdit={this.props.itemToEdit}
                            productCompanies={this.props.companyUsers}
                            activeProductId={this.props.activeItemId}
                            selectProduct={this.props.selectItem}
                            editProduct={this.props.editItem}
                            saveProduct={this.props.saveItem}
                            deleteProduct={this.props.deleteItem}
                            newProduct={this.props.newProduct}
                            cancelEdit={this.props.cancelEdit}
                            isLoading={this.props.isLoading}
                            activeQuery={this.props.activeQuery}
                            totalProducts={this.props.totalItems}
                            fetchProductCompanies={this.props.fetchProductCompanies}
                            errors={this.props.errors}
                            dispatch={this.props.dispatch}

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
    newProduct: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalItems: PropTypes.number,
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    companyUsers: PropTypes.arrayOf(PropTypes.object),
    selectMenu: PropTypes.func,
    selectedMenu: PropTypes.string,
    fetchItems: PropTypes.func,
    fetchProducts: PropTypes.func,
    fetchCompanyUsers: PropTypes.func,
    fetchProductCompanies: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
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
    newProduct: () => dispatch(newProduct()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    resetPassword: () => dispatch(resetPassword()),
    selectMenu: (event) => dispatch(updateMenu(event)),
    fetchItems: (type) => dispatch(fetchItems(type)),
    fetchProducts: () => dispatch(fetchProducts()),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId)),
    fetchProductCompanies: () => dispatch(fetchCompanies()),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsApp);
