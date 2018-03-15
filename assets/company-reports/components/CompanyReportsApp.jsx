import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    setActiveReport,
    runReport,
} from '../actions';
import { gettext } from 'utils';
import { panels } from '../utils';

const options = [
    {value: '', text: ''},
    {value: 'company-saved-searches', text: gettext('Saved searches per company')},
    {value: 'user-saved-searches', text: gettext('Saved searches per user')},
    {value: 'company-products', text: gettext('Products per company')},
    {value: 'product-stories', text: gettext('Stories per product')},
];


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
                        {this.props.activeReport && <button
                            className='btn btn-outline-secondary'
                            type='button'
                            onClick={this.props.runReport}>
                            {gettext('Run report')}
                        </button>}
                        {this.props.activeReport && <a
                            className='btn btn-outline-secondary ml-2'
                            type='button'
                            href={`/reports/print/${this.props.activeReport}`}
                            target="_blank">
                            {gettext('Print report')}
                        </a>}
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
