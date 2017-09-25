import React from 'react';
import PropTypes from 'prop-types';
import EditCompany from './EditCompany';
import CompanyList from './CompanyList';
import SearchResultsInfo from '../../../wire/components/SearchResultsInfo';

class Companies extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            errors: {},
        };
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

        this.setState({errors: errors});
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveCompany('companies');
    }

    deleteCompany(event) {
        event.preventDefault();

        if (confirm(`Would you like to delete company: ${this.props.companyToEdit.name}`)) {
            this.props.deleteCompany('companies');
        }
    }

    render() {
        const progressStyle = {width: '25%'};

        return (
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
                            totalItems={this.props.totalCompanies}
                            query={this.props.activeQuery} />
                        }
                        <CompanyList
                            companies={this.props.companies}
                            onClick={this.props.selectCompany}
                            activeCompanyId={this.props.activeCompanyId} />
                    </div>
                )}
                {this.props.companyToEdit &&
                    <EditCompany
                        company={this.props.companyToEdit}
                        onChange={this.props.editCompany}
                        errors={this.props.errors}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteCompany}
                    />
                }
            </div>
        );
    }
}

Companies.propTypes = {
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
    errors: PropTypes.object,
};

export default Companies;
