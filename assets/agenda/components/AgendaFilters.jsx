import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import AgendaTypeAheadFilter from './AgendaTypeAheadFilter';
import AgendaDropdownFilter from './AgendaDropdownFilter';
import {getCoverageDisplayName} from '../utils';
import AgendaCoverageExistsFilter from './AgendaCoverageExistsFilter';

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
}, {
    label: gettext('Any coverage type'),
    field: 'coverage',
    nestedField: 'coverage_type',
    icon: 'icon-small--coverage-text',
    transform: getCoverageDisplayName,
    eventsOnly: false,
}];


const getDropdownItems = (filter, aggregations, toggleFilter, processBuckets) => {
    if (!filter.nestedField && aggregations && aggregations[filter.field]) {
        return processBuckets(aggregations[filter.field].buckets, filter, toggleFilter);
    }

    if (filter.nestedField && aggregations && aggregations[filter.field] && aggregations[filter.field][filter.nestedField]) {
        return processBuckets(aggregations[filter.field][filter.nestedField].buckets, filter, toggleFilter);
    }

    return [];
};

function AgendaFilters({aggregations, toggleFilter, activeFilter, eventsOnly}) {
    const displayFilters = eventsOnly ? filters.filter((f) => f.eventsOnly) : filters;

    return (<div className='wire-column__main-header-agenda d-flex m-0 px-3 align-items-center flex-wrap flex-sm-nowrap'>
        {displayFilters.map((filter) => (
            filter.typeAhead ? <AgendaTypeAheadFilter
                key={filter.label}
                aggregations={aggregations}
                filter={filter}
                toggleFilter={toggleFilter}
                activeFilter={activeFilter}
                getDropdownItems={getDropdownItems}
            /> : <AgendaDropdownFilter
                key={filter.label}
                aggregations={aggregations}
                filter={filter}
                toggleFilter={toggleFilter}
                activeFilter={activeFilter}
                getDropdownItems={getDropdownItems}
            />
        ))}
        {!eventsOnly && <AgendaCoverageExistsFilter activeFilter={activeFilter} toggleFilter={toggleFilter}/>}
    </div>);
}

AgendaFilters.propTypes = {
    aggregations: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
    eventsOnly: PropTypes.bool,
};

export default AgendaFilters;
