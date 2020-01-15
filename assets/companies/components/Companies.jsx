import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {get} from 'lodash';

import EditCompany from './EditCompany';
import CompanyList from './CompanyList';
import SearchResults from 'search/components/SearchResults';

import {
    cancelEdit,
    deleteCompany,
    editCompany,
    fetchCompanyUsers,
    postCompany,
    selectCompany,
    setError,
} from '../actions';
import {searchQuerySelector} from 'search/selectors';
import {companiesSubscriberIdEnabled} from 'ui/selectors';
import {gettext} from 'utils';

class Companies extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteCompany = this.deleteCompany.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.companyToEdit.name) {
            errors.name = ['Please provide company name'];
            valid = false;
        }

        this.props.dispatch(setError(errors));
        return valid;
    }

    save(externalEvent) {
        if (externalEvent) {
            externalEvent.preventDefault();

            if (!this.isFormValid()) {
                return;
            }
        }

        this.props.saveCompany('companies');
    }

    deleteCompany(event) {
        event.preventDefault();

        if (confirm(gettext('Would you like to delete company: {{name}}', {name: this.props.companyToEdit.name}))) {
            this.props.deleteCompany('companies');
        }
    }

    render() {
        const progressStyle = {width: '25%'};
        const originalCompanyEdited = !get(this.props, 'companyToEdit._id') ? this.props.companyToEdit :
            this.props.companiesById[this.props.companyToEdit._id];

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
                                totalItems={this.props.totalCompanies}
                                totalItemsLabel={this.props.activeQuery}
                            />
                        )}
                        <CompanyList
                            companies={this.props.companies}
                            onClick={this.props.selectCompany}
                            activeCompanyId={this.props.activeCompanyId}
                            companyTypes={this.props.companyTypes}
                            showSubscriberId={this.props.showSubscriberId}
                        />
                    </div>
                )}
                {this.props.companyToEdit &&
                    <EditCompany
                        originalItem={originalCompanyEdited}
                        company={this.props.companyToEdit}
                        onChange={this.props.editCompany}
                        errors={this.props.errors}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteCompany}
                        users={this.props.companyUsers}
                        fetchCompanyUsers={this.props.fetchCompanyUsers}
                        products={this.props.products}
                        companyTypes={this.props.companyTypes}
                        apiEnabled={this.props.apiEnabled}
                    />
                }
            </div>
        );
    }
}

Companies.propTypes = {
    companies: PropTypes.arrayOf(PropTypes.object),
    companyToEdit: PropTypes.object,
    companyUsers: PropTypes.arrayOf(PropTypes.object),
    activeCompanyId: PropTypes.string,
    selectCompany: PropTypes.func,
    editCompany: PropTypes.func,
    saveCompany: PropTypes.func,
    deleteCompany: PropTypes.func,
    newCompany: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalCompanies: PropTypes.number,
    fetchCompanyUsers: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    products: PropTypes.array,
    companyTypes: PropTypes.array,
    apiEnabled: PropTypes.bool,
    showSubscriberId: PropTypes.bool,
    companiesById: PropTypes.array,
};

const mapStateToProps = (state) => ({
    companies: state.companies.map((id) => state.companiesById[id]),
    companyToEdit: state.companyToEdit,
    activeCompanyId: state.activeCompanyId,
    isLoading: state.isLoading,
    products: state.products,
    activeQuery: searchQuerySelector(state),
    totalCompanies: state.totalCompanies,
    companyOptions: state.companyOptions,
    companiesById: state.companiesById,
    companyUsers: state.companyUsers,
    errors: state.errors,
    companyTypes: state.companyTypes,
    apiEnabled: state.apiEnabled,
    showSubscriberId: companiesSubscriberIdEnabled(state),
});


const mapDispatchToProps = (dispatch) => ({
    selectCompany: (id) => dispatch(selectCompany(id)),
    editCompany: (event) => dispatch(editCompany(event)),
    saveCompany: () => dispatch(postCompany()),
    deleteCompany: () => dispatch(deleteCompany()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId)),
    dispatch: dispatch,
});


export default connect(mapStateToProps, mapDispatchToProps)(Companies);
