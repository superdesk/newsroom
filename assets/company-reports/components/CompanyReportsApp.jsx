import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    setActiveReport,
    runReport,
    REPORTS_NAMES,
    printReport,
} from '../actions';
import { gettext } from 'utils';
import { panels } from '../utils';

const options = [
    {value: '', text: ''},
    {value: REPORTS_NAMES.COMPANY_SAVED_SEARCHES, text: gettext('Saved searches per company')},
    {value: REPORTS_NAMES.USER_SAVED_SEARCHES, text: gettext('Saved searches per user')},
    {value: REPORTS_NAMES.COMPANY_PRODUCTS, text: gettext('Products per company')},
    {value: REPORTS_NAMES.PRODUCT_STORIES, text: gettext('Stories per product')},
    {value: REPORTS_NAMES.COMPANY, text: gettext('Company')},
    {value: REPORTS_NAMES.SUBSCRIBER_ACTIVITY, text: gettext('Subscriber activity')},
    {value: REPORTS_NAMES.CONTENT_ACTIVITY, text: gettext('Content activity')},
];


class CompanyReportsApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.getPanel = this.getPanel.bind(this);
    }

    getPanel() {
        const Panel = panels[this.props.activeReport];
        return Panel && this.props.results && <Panel key="panel" results={this.props.results} companies={this.props.companies} />;
    }

    render() {
        return (
            [<section key="header" className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    <div>
                        <select
                            className="ml-3 form-control form-control-lg"
                            id={'company-reports'}
                            name={'company-reports'}
                            value={this.props.activeReport || ''}
                            onChange={(event) => this.props.setActiveReport(event.target.value)}>
                            {options.map((option) => <option key={option.value} value={option.value}>{option.text}</option>)}
                        </select>
                    </div>

                    <div className="content-bar__right">
                        {this.props.activeReport && <button
                            className='btn btn-outline-secondary'
                            type='button'
                            onClick={this.props.runReport}>
                            {gettext('Run report')}
                        </button>}
                        {this.props.activeReport && <button
                            className='btn btn-outline-secondary ml-2'
                            type='button'
                            onClick={this.props.printReport} >
                            {gettext('Print report')}
                        </button>}
                    </div>
                </nav>
            </section>,
            this.getPanel()]

        );
    }
}

CompanyReportsApp.propTypes = {
    activeReport: PropTypes.string,
    results: PropTypes.array,
    setActiveReport: PropTypes.func,
    runReport: PropTypes.func,
    companies: PropTypes.array,
    printReport: PropTypes.func,
};

const mapStateToProps = (state) => ({
    activeReport: state.activeReport,
    results: state.results,
    companies: state.companies,
});

const mapDispatchToProps = {
    setActiveReport,
    runReport,
    printReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(CompanyReportsApp);
