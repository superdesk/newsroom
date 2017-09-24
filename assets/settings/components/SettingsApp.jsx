import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectItem, editItem, cancelEdit, resetPassword, postItem, newItem } from '../actions';
import UserBar from './users/UserBar';
import Users from './users/Users';
import SettingsMenu from './SettingsMenu';

class SettingsApp extends React.Component {
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

        if (!this.props.itemToEdit.email) {
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

        this.props.saveItem(event);
    }

    render() {
        return (
            <div className="row">
                <div className='col-1' id='settings-menu'>
                    <SettingsMenu
                        onClick={this.props.selectMenu}
                        isCompanySettings={this.props.selectedMenu === 'companies'}
                        isUserSettings={this.props.selectedMenu === 'users'}
                        isSystemSettings={this.props.selectedMenu === 'system'}
                    />
                </div>
                <div className="col" id="settings-app">
                    <UserBar
                        onNewUser={this.props.newItem}
                    />
                    <Users
                        users={this.props.items}
                        userToEdit={this.props.itemToEdit}
                        activeUserId={this.props.activeItemId}
                        selectUser={this.props.selectItem}
                        editUser={this.props.editItem}
                        saveUser={this.props.saveItem}
                        newUser={this.props.newItem}
                        resetPassword={this.props.resetPassword}
                        cancelEdit={this.props.cancelEdit}
                        isLoading={this.props.isLoading}
                        activeQuery={this.props.activeQuery}
                        totalUsers={this.props.totalItems}
                        companyOptions={this.props.companyOptions}
                        companiesById={this.props.companiesById}
                        errors={this.props.errors}
                    />
                </div>
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
    newItem: PropTypes.func,
    resetPassword: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalItems: PropTypes.number,
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
    selectMenu: PropTypes.func,
    selectedMenu: PropTypes.string,
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
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectItem: (_id) => dispatch(selectItem(_id)),
    editItem: (event) => dispatch(editItem(event)),
    saveItem: (event) => dispatch(postItem(event)),
    newItem: () => dispatch(newItem()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    resetPassword: (event) => dispatch(resetPassword(event)),
    selectMenu: (event) => dispatch(selectMenu(event)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsApp);
