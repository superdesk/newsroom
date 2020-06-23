import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import {gettext} from 'utils';
import AgendaTypeAheadFilter from './AgendaTypeAheadFilter';
import DropdownFilter from '../../components/DropdownFilter';
import {getCoverageDisplayName, groupRegions, getRegionName} from '../utils';
import AgendaCoverageExistsFilter from './AgendaCoverageExistsFilter';
import AgendaEventsOnlyFilter from './AgendaEventsOnlyFilter';


const transformFilterBuckets = (filter, aggregations, props) => {
    if (!filter.transformBuckets) {
        return aggregations[filter.field].buckets;
    }

    return filter.transformBuckets(filter, aggregations, props);
};

const filters = [{
    label: gettext('Any calendar'),
    field: 'calendar',
    icon: 'icon-small--calendar',
    eventsOnly: true,
}, {
    label: gettext('Any location'),
    field: 'location',
    typeAhead: true,
    icon: 'icon-small--location',
    eventsOnly: true,
}, {
    label: gettext('Any region'),
    field: 'place',
    icon: 'icon-small--region',
    eventsOnly: true,
    transformBuckets: groupRegions,
    notSorted: true,
    transform: getRegionName,
    getFilterLabel: (filter, activeFilter, isActive, props) => {
        if (!isActive) {
            return filter.label;
        }

        let region;
        if (get(activeFilter, `${filter.field}[0]`) && props.locators) {
            region = (Object.values(props.locators) || []).find((l) => l.name === get(activeFilter, `${filter.field}[0]`));
        }

        return region ? (get(region, 'state') || get(region, 'country') || get(region, 'world_region')) : get(activeFilter, `${filter.field}[0]`);
    }
}, {
    label: gettext('Any coverage type'),
    field: 'coverage',
    nestedField: 'coverage_type',
    icon: 'icon-small--coverage-text',
    transform: getCoverageDisplayName,
    eventsOnly: false,
}];


const getDropdownItems = (filter, aggregations, toggleFilter, processBuckets, props) => {
    if (!filter.nestedField && aggregations && aggregations[filter.field]) {
        return processBuckets(transformFilterBuckets(filter, aggregations, props), filter, toggleFilter);
    }

    if (filter.nestedField && aggregations && aggregations[filter.field] && aggregations[filter.field][filter.nestedField]) {
        return processBuckets(aggregations[filter.field][filter.nestedField].buckets, filter, toggleFilter);
    }

    return [];
};

function AgendaFilters({aggregations, toggleFilter, activeFilter, eventsOnlyAccess, eventsOnlyView, locators}) {
    const displayFilters = eventsOnlyAccess || eventsOnlyView ? filters.filter((f) => f.eventsOnly) : filters;

    return (<div className='wire-column__main-header-agenda d-flex m-0 px-3 align-items-center flex-wrap flex-sm-nowrap'>
        {displayFilters.map((filter) => (
            filter.typeAhead ? <AgendaTypeAheadFilter
                key={filter.label}
                aggregations={aggregations}
                filter={filter}
                toggleFilter={toggleFilter}
                activeFilter={activeFilter}
                getDropdownItems={getDropdownItems}
            /> : <DropdownFilter
                key={filter.label}
                aggregations={aggregations}
                filter={filter}
                toggleFilter={toggleFilter}
                activeFilter={activeFilter}
                getDropdownItems={getDropdownItems}
                locators={locators}
                getFilterLabel={filter.getFilterLabel}
            />
        ))}
        {!eventsOnlyAccess && !eventsOnlyView &&
         <AgendaCoverageExistsFilter activeFilter={activeFilter} toggleFilter={toggleFilter}/>}
        {!eventsOnlyAccess &&
         <AgendaEventsOnlyFilter eventsOnlyView={eventsOnlyView} toggleFilter={toggleFilter}/>}
    </div>);
}

AgendaFilters.propTypes = {
    aggregations: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
    eventsOnlyAccess: PropTypes.bool,
    eventsOnlyView: PropTypes.bool,
    locators: PropTypes.arrayOf(PropTypes.object),
};

export default AgendaFilters;
