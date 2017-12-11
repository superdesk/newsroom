import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    selectCompany,
    editCompany,
    cancelEdit,
    postCompany,
    deleteCompany,
    newCompany,
    fetchCompanies,
    fetchCompanyUsers,
    setQuery,
} from '../actions';
import Companies from './Companies';
import ListBar from 'components/ListBar';

class CompaniesApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="CompanyBar"
                onNewItem={this.props.newCompany}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchCompanies}
                buttonName={'Company'}
            />,
            <Companies
                key="Companies"
                companies={this.props.companies}
                companyToEdit={this.props.companyToEdit}
                companyUsers={this.props.companyUsers}
                activeCompanyId={this.props.activeCompanyId}
                selectCompany={this.props.selectCompany}
                editCompany={this.props.editCompany}
                saveCompany={this.props.saveCompany}
                deleteCompany={this.props.deleteCompany}
                newCompany={this.props.newCompany}
                cancelEdit={this.props.cancelEdit}
                isLoading={this.props.isLoading}
                activeQuery={this.props.activeQuery}
                totalCompanies={this.props.totalCompanies}
                fetchCompanyUsers={this.props.fetchCompanyUsers}
                errors={this.props.errors}
                dispatch={this.props.dispatch}

            />]
        );
    }
}

CompaniesApp.propTypes = {
    companies: PropTypes.arrayOf(PropTypes.object),
    companyToEdit: PropTypes.object,
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
    companyOptions: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    companyUsers: PropTypes.arrayOf(PropTypes.object),
    fetchCompanies: PropTypes.func,
    fetchCompanyUsers: PropTypes.func,
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

const mapStateToProps = (state) => ({
    companies: state.companies.map((id) => state.companiesById[id]),
    companyToEdit: state.companyToEdit,
    activeCompanyId: state.activeCompanyId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalCompanies: state.totalCompanies,
    companyOptions: state.companyOptions,
    companiesById: state.companiesById,
    companyUsers: state.companyUsers,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectCompany: (id) => dispatch(selectCompany(id)),
    editCompany: (event) => dispatch(editCompany(event)),
    saveCompany: () => dispatch(postCompany()),
    deleteCompany: () => dispatch(deleteCompany()),
    newCompany: (data) => dispatch(newCompany(data)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    fetchCompanies: () => dispatch(fetchCompanies()),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId)),
    setQuery: (query) => dispatch(setQuery(query)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(CompaniesApp);
