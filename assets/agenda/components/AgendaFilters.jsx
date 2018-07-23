import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

const filters = [{
    label: gettext('Any calendar'),
    field: 'calendar'
}, {
    label: gettext('Any location'),
    field: 'location'
}, {
    label: gettext('Any region'),
    field: 'place'
}, {
    label: gettext('Any coverage'),
    field: 'coverage'
}];

const getActiveFilterLabel = (filter, activeFilter) => activeFilter[filter.field] ?
    activeFilter[filter.field][0] : gettext(filter.label);


function AgendaFilters({aggregations, toggleFilter, activeFilter}) {
    return (<div className='wire-column__main-header-agenda d-flex m-0 px-3 align-items-center flex-wrap flex-sm-nowrap'>
        {filters.map((filter) => <div className="btn-group" key={filter.field}>
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
                {aggregations[filter.field] && aggregations[filter.field].buckets.map((bucket) =>
                    <button
                        key={bucket.key}
                        className='dropdown-item'
                        onClick={() => toggleFilter(filter.field, bucket.key)}
                    >{bucket.key}</button>)}
            </div>
        </div>)}
    </div>);
}

AgendaFilters.propTypes = {
    aggregations: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
};

export default AgendaFilters;
