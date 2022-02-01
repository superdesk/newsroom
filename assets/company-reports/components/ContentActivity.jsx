import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {connect} from 'react-redux';
import {get, keyBy, cloneDeep} from 'lodash';

import {gettext, formatTime} from '../../utils';
import {fetchReport, REPORTS, runReport, toggleFilter, fetchAggregations} from '../actions';

import CalendarButton from '../../components/CalendarButton';
import MultiSelectDropdown from '../../components/MultiSelectDropdown';
import ReportsTable from './ReportsTable';

class ContentActivity extends React.Component {
    constructor(props) {
        super(props);

        this.onDateChange = this.onDateChange.bind(this);
        this.exportToCSV = this.exportToCSV.bind(this);
        this.onChangeSection = this.onChangeSection.bind(this);

        this.state = {
            filters: ['section', 'genre', 'company', 'action'],
            results: [],
            section: {
                field: 'section',
                label: gettext('Section'),
                options: this.props.sections
                    .filter((section) => section.group === 'wire' || (section.group === 'api' && this.props.apiEnabled)
                    || section.group === 'monitoring')
                    .map((section) => ({
                        label: section.name,
                        value: section.name,
                    })),
                onChange: this.onChangeSection,
                showAllButton: false,
                multi: false,
                default: this.props.sections[0].name,
            },
            genre: {
                field: 'genre',
                label: gettext('Genres'),
                options: [],
                onChange: this.props.toggleFilter,
                showAllButton: true,
                multi: true,
                default: [],
            },
            company: {
                field: 'company',
                label: gettext('Companies'),
                options: [],
                onChange: this.props.toggleFilter,
                showAllButton: true,
                multi: false,
                default: null,
            },
            action: {
                field: 'action',
                label: gettext('Actions'),
                options: [
                    {label: gettext('Download'), value: 'download'},
                    {label: gettext('Copy'), value: 'copy'},
                    {label: gettext('Share'), value: 'share'},
                    {label: gettext('Print'), value: 'print'},
                    {label: gettext('Open'), value: 'open'},
                    {label: gettext('Preview'), value: 'preview'},
                    {label: gettext('Clipboard'), value: 'clipboard'},
                    {label: gettext('API retrieval'), value: 'api'},
                    {label: gettext('Email'), value: 'email'},
                ],
                onChange: this.props.toggleFilter,
                showAllButton: true,
                multi: true,
                default: [],
            }
        };
    }

    componentWillMount() {
        // Fetch the genre & company aggregations to populate those dropdowns
        this.props.fetchAggregations(REPORTS['content-activity']);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.results !== nextProps.results) {
            this.updateResults(nextProps);
        }

        if (this.props.aggregations !== nextProps.aggregations) {
            this.updateAggregations(nextProps);
        }
    }

    getFilteredActions() {
        let actions = get(this.props, 'reportParams.action');

        if (!get(actions, 'length', 0)) {
            actions = ['download', 'copy', 'share', 'print', 'open', 'preview', 'clipboard', 'api', 'email'];
        }

        return actions;
    }

    getHeaders() {
        const headers = [
            gettext('Published'),
            gettext('Headline'),
            gettext('Take Key'),
            gettext('Place'),
            gettext('Category'),
            gettext('Subject'),
            gettext('Companies'),
            gettext('Actions'),
        ];
        const actions = this.getFilteredActions();

        actions.includes('download') && headers.push(gettext('Download'));
        actions.includes('copy') && headers.push(gettext('Copy'));
        actions.includes('share') && headers.push(gettext('Share'));
        actions.includes('print') && headers.push(gettext('Print'));
        actions.includes('open') && headers.push(gettext('Open'));
        actions.includes('preview') && headers.push(gettext('Preview'));
        actions.includes('clipboard') && headers.push(gettext('Clipboard'));
        actions.includes('api') && headers.push(gettext('API retrieval'));
        actions.includes('email') && headers.push(gettext('Email'));

        return headers;
    }

    updateAggregations(props) {
        const genre = cloneDeep(this.state.genre);
        const company = cloneDeep(this.state.company);

        genre.options = props.aggregations.genres
            .sort()
            .map((genre) => ({
                label: genre,
                value: genre,
            }));
        company.options = props.companies
            .filter((company) => props.aggregations.companies.includes(company._id))
            .map((company) => ({
                label: company.name,
                value: company.name,
            }));

        this.setState({
            genre,
            company,
        });
    }

    updateResults(props) {
        const companies = keyBy(this.props.companies, '_id');

        const results = props.results.map(
            (item) => ({
                _id: item._id,
                versioncreated: formatTime(get(item, 'versioncreated') || ''),
                headline: get(item, 'headline') || '',
                anpa_take_key: get(item, 'anpa_take_key') || '',
                place: (get(item, 'place') || [])
                    .map((place) => place.name)
                    .sort(),
                service: (get(item, 'service') || [])
                    .map((service) => service.name)
                    .sort(),
                subject: (get(item, 'subject') || [])
                    .map((subject) => subject.name)
                    .sort(),
                total: get(item, 'aggs.total') || 0,
                companies: (get(item, 'aggs.companies') || [])
                    .map((company) => companies[company].name)
                    .sort(),
                actions: {
                    download: get(item, 'aggs.actions.download') || 0,
                    copy: get(item, 'aggs.actions.copy') || 0,
                    share: get(item, 'aggs.actions.share') || 0,
                    print: get(item, 'aggs.actions.print') || 0,
                    open: get(item, 'aggs.actions.open') || 0,
                    preview: get(item, 'aggs.actions.preview') || 0,
                    clipboard: get(item, 'aggs.actions.clipboard') || 0,
                    api: get(item, 'aggs.actions.api') || 0,
                    email: get(item, 'aggs.actions.email') || 0,
                }
            })
        );
        this.setState({results});
    }

    onDateChange(value) {
        this.props.toggleFilter('date_from', value);
        this.props.fetchAggregations(REPORTS['content-activity']);
    }

    onChangeSection(field, value) {
        this.props.toggleFilter('section', value);
        this.props.fetchAggregations(REPORTS['content-activity']);
    }

    exportToCSV() {
        this.props.fetchReport(
            REPORTS['content-activity'],
            false,
            true
        );
    }

    renderList() {
        const {results} = this.state;
        const actions = this.getFilteredActions();

        if (get(results, 'length', 0) > 0) {
            return results.map((item) =>
                <tr key={item._id}>
                    <td>{item.versioncreated}</td>
                    <td>{item.headline}</td>
                    <td>{item.anpa_take_key}</td>
                    <td>{item.place.map((place) => (
                        <Fragment key={place}>
                            {place}<br />
                        </Fragment>
                    ))}</td>
                    <td>{item.service.map((service) => (
                        <Fragment key={service}>
                            {service}<br />
                        </Fragment>
                    ))}</td>
                    <td>{item.subject.map((subject) => (
                        <Fragment key={subject}>
                            {subject}<br />
                        </Fragment>
                    ))}</td>
                    <td>{item.companies.map((company) => (
                        <Fragment key={company}>
                            {company}<br />
                        </Fragment>
                    ))}</td>
                    <td>{item.total}</td>
                    {actions.includes('download') && <td>{item.actions.download}</td>}
                    {actions.includes('copy') && <td>{item.actions.copy}</td>}
                    {actions.includes('share') && <td>{item.actions.share}</td>}
                    {actions.includes('print') && <td>{item.actions.print}</td>}
                    {actions.includes('open') && <td>{item.actions.open}</td>}
                    {actions.includes('preview') && <td>{item.actions.preview}</td>}
                    {actions.includes('clipboard') && <td>{item.actions.clipboard}</td>}
                    {actions.includes('api') && <td>{item.actions.api}</td>}
                    {actions.includes('email') && <td>{item.actions.email}</td>}
                </tr>
            );
        }

        return [
            <tr key='no_data_row'>
                <td colSpan={this.getHeaders().length}>{gettext('No Data')}</td>
            </tr>,
        ];
    }

    render() {
        const {print, reportParams} = this.props;
        const {filters} = this.state;

        return (
            <Fragment>
                <div className="align-items-center d-flex flex-sm-nowrap flex-wrap m-0 px-3 wire-column__main-header-agenda">
                    <div className='ml-3' style={{marginRight: '-1rem'}}>
                        <CalendarButton
                            key='content_activity_date'
                            selectDate={this.onDateChange}
                            activeDate={get(reportParams, 'date_from') || moment()}
                        />
                    </div>

                    {filters.map((filterName) => {
                        const filter = this.state[filterName];

                        return (
                            <MultiSelectDropdown
                                key={filterName}
                                {...filter}
                                values={reportParams[filter.field] || filter.default}
                            />
                        );
                    })}

                    <button
                        key='content_activity_export'
                        className="btn btn-outline-secondary ml-auto mr-3"
                        type="button"
                        onClick={this.exportToCSV}
                    >{gettext('Export to CSV')}</button>
                </div>
                <ReportsTable
                    key='report_table'
                    headers={this.getHeaders()}
                    rows={this.renderList()}
                    print={print}
                    tableClass='content-activity__table'
                />
            </Fragment>
        );
    }
}

ContentActivity.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
    companies: PropTypes.array,
    runReport: PropTypes.func,
    toggleFilter: PropTypes.func,
    isLoading: PropTypes.bool,
    fetchReport: PropTypes.func,
    reportParams: PropTypes.object,
    sections: PropTypes.array,
    fetchAggregations: PropTypes.func,
    aggregations: PropTypes.object,
    apiEnabled: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    companies: state.companies,
    reportParams: state.reportParams,
    isLoading: state.isLoading,
    sections: state.sections,
    aggregations: state.reportAggregations,
});

const mapDispatchToProps = {
    toggleFilter,
    fetchReport,
    runReport,
    fetchAggregations,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentActivity);
