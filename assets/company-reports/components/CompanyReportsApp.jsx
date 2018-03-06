import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    setActiveReport,
    runReport,
} from '../actions';
import {gettext} from '../../utils';
import CompanySavedSearches from './CompanySavedSearches';
import UserSavedSearches from './UserSavedSearches';
import CompanyProducts from './CompanyProducts';

const options = [
    {value: '', text: ''},
    {value: 'company-saved-searches', text: gettext('Saved searches per company')},
    {value: 'user-saved-searches', text: gettext('Saved searches per user')},
    {value: 'company-products', text: gettext('Products per company')},
];

const panels = {
    'company-saved-searches': CompanySavedSearches,
    'user-saved-searches': UserSavedSearches,
    'company-products': CompanyProducts,
};

class CompanyReportsApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.getPanel = this.getPanel.bind(this);
    }

    getPanel() {
        const Panel = panels[this.props.activeReport];
        return Panel && this.props.activeReportData && <Panel key="panel" data={this.props.activeReportData} />;
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
                        <button
                            className='btn btn-outline-secondary'
                            type='button'
                            onClick={this.props.runReport}>
                            {gettext('Run report')}
                        </button>
                    </div>
                </nav>
            </section>,
            this.getPanel()]

        );
    }
}

CompanyReportsApp.propTypes = {
    activeReport: PropTypes.string,
    activeReportData: PropTypes.object,
    setActiveReport: PropTypes.func,
    runReport: PropTypes.func,
};

const mapStateToProps = (state) => ({
    activeReport: state.activeReport,
    activeReportData: state.activeReportData,
});

const mapDispatchToProps = {
    setActiveReport,
    runReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(CompanyReportsApp);
