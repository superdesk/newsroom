import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { gettext, fullDate, upperCaseFirstCharacter } from 'utils';
import { get } from 'lodash';
import ReportsTable from './ReportsTable';
import DropdownFilter from '../../components/DropdownFilter';
import CalendarButton from '../../components/CalendarButton';
import {toggleFilterAndQuery, fetchReport, REPORTS, runReport} from '../actions';

class SubscriberActivity extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.companies = [...this.props.companies.map((c) => ({...c, 'label': c.name}))];
        this.state = { company: this.props.companies[0] };

        this.filters = [{
            label: gettext('All Companies'),
            field: 'company'
        },
        {
            label: gettext('All Actions'),
            field: 'action'
        }];
        this.getDropdownItems = this.getDropdownItems.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onFromDateChange = this.onFromDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.previousScrollTop = 0;
    }

    componentWillMount() {
        // Run report on initial loading with default filters
        this.props.runReport();
    }

    getDropdownItems(filter) {
        const { toggleFilterAndQuery } = this.props;
        // Company is not filtered, always show full list
        if (filter.field === 'company') {
            return this.companies.map((c) => {
                return (<button
                    key={c._id}
                    className='dropdown-item'
                    onClick={() => toggleFilterAndQuery(filter.field, c.name)}
                >{c.name}</button>);
            });
        }

        if (filter.field === 'action') {
            return ['download', 'copy', 'share', 'print'].map((c, i) => {
                return (<button
                    key={i}
                    className='dropdown-item'
                    onClick={() => toggleFilterAndQuery(filter.field, c)}
                >{upperCaseFirstCharacter(c)}</button>);
            });
        }

        return [];
    }

    getFilterLabel(filter, activeFilter) {
        if (activeFilter[filter.field]) {
            return activeFilter[filter.field];
        } else {
            return filter.label;
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
            this.props.fetchReport(REPORTS['subscriber-activity'], true);
            this.previousScrollTop = node.scrollTop;
        }
    }

    onFromDateChange(value) {
        this.props.toggleFilterAndQuery('date_from', value);

    }

    onEndDateChange(value) {
        this.props.toggleFilterAndQuery('date_to', value);
    }

    render() {
        const {results, print, reportParams, toggleFilterAndQuery} = this.props;
        const headers = [gettext('Company'), gettext('Section'), gettext('Item'), gettext('Action'), gettext('User'), gettext('Time')];
        let list = get(results, 'length', 0) > 0 ? results.map((item) =>
            <tr key={item._id} className="table-secondary">
                <td>{item.company}</td>
                <td>{item.section}</td>
                <td>
                    {get(item, 'item.item_href', null) &&
                        <a href={get(item, 'item.item_href', '#')} target="_blank">{get(item, 'item.item_text')}</a>}
                    {!get(item, 'item.item_href') && <span>{get(item, 'item.item_text')}</span>}
                </td>
                <td>{item.action}</td>
                <td>{item.user}</td>
                <td>{fullDate(item.created)}</td>
            </tr>
        ) : ([(<tr key='no_data_row' className="table-secondary">
            <td></td>
            <td></td>
            <td>{gettext('No Data')}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>)]);

        let filterNodes = this.filters.map((filter) => (
            <DropdownFilter
                key={filter.label}
                filter={filter}
                getDropdownItems={this.getDropdownItems}
                activeFilter={reportParams}
                getFilterLabel={this.getFilterLabel}
                toggleFilter={toggleFilterAndQuery}
            />
        ));

        filterNodes.push((<CalendarButton
            key='subscriver_activity_from'
            labelClass='ml-3 mt-1'
            label={gettext('FROM:')}
            selectDate={this.onFromDateChange}
            activeDate={get(reportParams, 'date_from') || moment()} />));
        filterNodes.push((<CalendarButton
            key='subscriver_activity_to'
            labelClass='mt-1'
            label={gettext('TO:')}
            selectDate={this.onEndDateChange}
            activeDate={get(reportParams, 'date_to') || moment()} />));
        /* filterNodes.push(<span
            key='subscriver_activity_export'
            className="btn btn-outline-secondary ml-2"
            type="button"
            onClick={() => {this.props.fetchReport(REPORTS['subscriber-activity'], false, true);}}>Export to CSV</span>); */

        const filterSection = (<div key='report_filters' className="align-items-center d-flex flex-sm-nowrap flex-wrap m-0 px-3 wire-column__main-header-agenda">{filterNodes}</div>);

        return [filterSection,
            (<ReportsTable key='report_table' headers={headers} rows={list} print={print} onScroll={this.onScroll} />)];
    }
}

SubscriberActivity.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
    companies: PropTypes.array,
    runReport: PropTypes.func,
    toggleFilterAndQuery: PropTypes.func,
    isLoading: PropTypes.bool,
    fetchReport: PropTypes.func,
    reportParams: PropTypes.object,
};

const mapStateToProps = (state) => ({
    companies: state.companies,
    reportParams: state.reportParams,
    isLoading: state.isLoading,
});

const mapDispatchToProps = { toggleFilterAndQuery, fetchReport, runReport };

export default connect(mapStateToProps, mapDispatchToProps)(SubscriberActivity);
