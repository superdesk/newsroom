import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {get} from 'lodash';
import ReportsTable from './ReportsTable';
import CalendarButton from 'components/CalendarButton';
import { gettext } from 'utils';
import {REPORTS} from '../actions';


class ComapnyNewsApiUsage extends React.Component {
    constructor(props) {
        super(props);

        this.onFromDateChange = this.onFromDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onScroll = this.onScroll.bind(this);

        this.previousScrollTop = 0;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.reportParams !== nextProps.reportParams) {
            // Filtering done
            this.previousScrollTop = 0;
        }
    }

    onScroll(event) {
        if (this.props.isLoading) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        const node = event.target;
        if (node && (node.scrollTop + node.offsetHeight + 100 >= node.scrollHeight) &&
            node.scrollTop > (this.previousScrollTop + 2)) {
            this.props.fetchReport(REPORTS['company-news-api-usage'], true);
            this.previousScrollTop = node.scrollTop;
        }
    }

    componentWillMount() {
        // Run report on initial loading with default filters
        this.props.runReport();
    }

    onFromDateChange(value) {
        this.props.toggleFilterAndQuery('date_from', value);
    }

    onEndDateChange(value) {
        this.props.toggleFilterAndQuery('date_to', value);
    }

    render() {
        const {results, print, reportParams, resultHeaders} = this.props;
        let list = [];
        Object.keys(results).forEach((company) => {
            const rowColums = [
                (<td key={'name-' + company}>{company}</td>),
                ...resultHeaders.map((headerName, index) => 
                    (<td key={index}>{get(results[company], headerName, 0)}</td>))
            ];
            list.push((<tr key={company}>{rowColums}</tr>));
        });

        if (!list.length) {
            list = [(<tr key='no_data_row'>
                <td></td>
                <td>{gettext('No Data')}</td>
                <td></td>
            </tr>)];
        }

        const headers = [gettext('Company'), ...(resultHeaders)];
        const filterNodes = [
            (<CalendarButton
                key='news_api_from'
                labelClass='ml-3 mt-1'
                label={gettext('FROM:')}
                selectDate={this.onFromDateChange}
                activeDate={get(reportParams, 'date_from') || moment()} />),
            (<CalendarButton
                key='news_api_to'
                labelClass='mt-1'
                label={gettext('TO:')}
                selectDate={this.onEndDateChange}
                activeDate={get(reportParams, 'date_to') || moment()} />)];
        const filterSection = (<div key='report_filters'
            className="align-items-center d-flex flex-sm-nowrap flex-wrap m-0 px-3 wire-column__main-header-agenda">
            {filterNodes}
        </div>);

        return (<Fragment>
            {filterSection}
            <ReportsTable headers={headers} rows={list} print={print} onScroll={this.onScroll}/>
        </Fragment>);
    }
}

ComapnyNewsApiUsage.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
    reportParams: PropTypes.object,
    isLoading: PropTypes.bool,
    fetchReport: PropTypes.func,
    runReport: PropTypes.func,
    toggleFilterAndQuery: PropTypes.func,
    resultHeaders: PropTypes.array,

};

export default ComapnyNewsApiUsage;
