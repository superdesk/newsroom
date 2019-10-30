import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newCompany,
    fetchCompanies,
} from '../actions';
import {setSearchQuery} from 'search/actions';
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
                buttonName={gettext('Company')}
            />,
            <Companies key="Companies" />
            ]
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


const mapDispatchToProps = {
    newCompany,
    fetchCompanies,
    setQuery: setSearchQuery,
};

export default connect(null, mapDispatchToProps)(CompaniesApp);
