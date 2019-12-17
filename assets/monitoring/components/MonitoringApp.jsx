import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newMonitoringProfile,
    setQuery,
    fetchMonitoring,
    setCompany,
    toggleScheduleMode
} from '../actions';
import MonitoringPanel from './MonitoringPanel';
import ListBar from 'components/ListBar';
import DropdownFilter from 'components/DropdownFilter';


class MonitoringApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onChange = this.onChange.bind(this);
        this.getDropdownItems = this.getDropdownItems.bind(this);
        this.onSectionChange = this.onSectionChange.bind(this);

        this.sections = [
            { name: gettext('Monitoring Profiles') },
            { name: gettext('Schedules') },
        ];

        this.state = {
            activeSection: this.sections[0].name,
            filter: {
                label:gettext('All Companies'),
                field: 'company'
            }
        };
    }

    isScheduleMode(sectionName = this.state.activeSection) {
        return sectionName === 'Schedules';
    }

    onSectionChange(sectionName) {
        if (sectionName !== this.state.activeSection) {
            this.setState({
                activeSection: sectionName,
                filter: {
                    label: this.isScheduleMode(sectionName) ? gettext('Companies with schedules') :
                        gettext('All Companies'),
                    field: 'company'
                }
            });

            this.props.toggleScheduleMode();
            this.onChange('company', null);
        }
    }

    getDropdownItems(filter) {
        const companies = this.isScheduleMode() ? this.props.monitoringListCompanies : this.props.companies;
        return (companies).map((item, i) => (<button
            key={i}
            className='dropdown-item'
            onClick={() => {this.onChange(filter.field, item._id);}}
        >{item.name}</button>));        
    }

    getActiveQuery() {
        return {
            company: this.props.company ? [get(this.props.companies.find((c) => c._id === this.props.company), 'name')] :
                null,
        };
    }

    render() {
        const activeQuery = this.getActiveQuery();
        return (
            <Fragment>
                <ListBar
                    onNewItem={this.isScheduleMode() ? null : this.props.newMonitoringProfile}
                    buttonName={gettext('Monitoring Profile')}
                    noSearch>
                    <div className="btn-group btn-group--navbar ml-0 mr-3">
                        {this.sections.map((section) => (
                            <button key={section.name}
                                className={'btn btn-outline-primary' + (section.name === this.state.activeSection ? ' active' :
                                    '')}
                                onClick={this.onSectionChange.bind(null, section.name)}
                            >{gettext(section.name)}</button>
                        ))}
                    </div>
                </ListBar>
                <div className='align-items-center d-flex flex-sm-nowrap flex-wrap m-0 px-3 wire-column__main-header-agenda pl-3'>
                    <DropdownFilter
                        filter={this.state.filter}
                        getDropdownItems={this.getDropdownItems}
                        activeFilter={activeQuery}
                        toggleFilter={this.onChange}
                        className='pl-3'
                    />
                </div>
                <MonitoringPanel />
            </Fragment>
            
        );
    }

    onChange(field, value)
    {
        if (field === 'company') {
            this.props.setCompany(value);
        }
        
        this.props.fetchMonitoring();
    }
}

const mapStateToProps = (state) => ({
    companies: state.companies,
    company: state.company,
    monitoringListCompanies: state.monitoringListCompanies,
});

MonitoringApp.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object),
    activeQuery: PropTypes.string,
    companies: PropTypes.arrayOf(PropTypes.object),
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    fetchCompanies: PropTypes.func,
    setCompany: PropTypes.func,
    company: PropTypes.string,
    monitoringListCompanies: PropTypes.array,
    toggleScheduleMode: PropTypes.func,
    newMonitoringProfile: PropTypes.func,
    fetchMonitoring: PropTypes.func,
};

const mapDispatchToProps = {
    newMonitoringProfile,
    setQuery,
    fetchMonitoring,
    setCompany,
    toggleScheduleMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(MonitoringApp);
