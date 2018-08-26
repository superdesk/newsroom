import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';


const getActiveFilterLabel = (filter, activeFilter) => activeFilter[filter.field] ?
    activeFilter[filter.field][0] : gettext(filter.label);

const getDropdownItems = (filter, aggregations, toggleFilter) => {
    if (!filter.nestedField && aggregations && aggregations[filter.field]) {
        return processBuckets(aggregations[filter.field].buckets, filter, toggleFilter);
    }

    if (filter.nestedField && aggregations && aggregations[filter.field] && aggregations[filter.field][filter.nestedField]) {
        return processBuckets(aggregations[filter.field][filter.nestedField].buckets, filter, toggleFilter);
    }

    return null;
};

const processBuckets = (buckets, filter, toggleFilter) => buckets.map((bucket) =>
    <button
        key={bucket.key}
        className='dropdown-item'
        onClick={() => toggleFilter(filter.field, bucket.key)}
    >{bucket.key}</button>);

function AgendaDropdownFilter({aggregations, filter, toggleFilter, activeFilter}) {
    return (<div className="btn-group" key={filter.field}>
        <button
            id={filter.field}
            type='button'
            className='btn btn-outline-primary btn-sm d-flex align-items-center px-2 ml-2'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'>
            <i className='icon-small--calendar d-sm-none'></i>
            <span className='d-none d-sm-block'>{getActiveFilterLabel(filter, activeFilter)}</span>
            <i className='icon-small--arrow-down ml-1'></i>
        </button>
        <div className='dropdown-menu' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, null)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            {getDropdownItems(filter, aggregations, toggleFilter)}
        </div>
    </div>);
}

AgendaDropdownFilter.propTypes = {
    aggregations: PropTypes.object,
    filter: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
};

export default AgendaDropdownFilter;