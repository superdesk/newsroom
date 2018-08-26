import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';

const getActiveFilterLabel = (filter, activeFilter) => {
    return activeFilter[filter.field] ? activeFilter[filter.field][0] : gettext(filter.label);
};

const getActiveTypeahead = (filter, activeFilter) => {
    return activeFilter[filter.field] ? activeFilter[filter.field][0] : [];
};

const getDropdownItems = (filter, aggregations, toggleFilter) => {
    if (!filter.nestedField && aggregations && aggregations[filter.field]) {
        return processBuckets(aggregations[filter.field].buckets, filter, toggleFilter);
    }

    if (filter.nestedField && aggregations && aggregations[filter.field] && aggregations[filter.field][filter.nestedField]) {
        return processBuckets(aggregations[filter.field][filter.nestedField].buckets, filter, toggleFilter);
    }

    return null;
};

const processBuckets = (buckets) => buckets.map((bucket) => bucket.key);

function AgendaTypeAheadFilter({aggregations, filter, toggleFilter, activeFilter}) {
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
            <Typeahead
                labelKey={filter.label}
                onChange={(selected) => toggleFilter(filter.field, selected.length ? selected : null)}
                options={getDropdownItems(filter, aggregations, toggleFilter)}
                placeholder={gettext('Choose a location...')}
                selected={getActiveTypeahead(filter, activeFilter)}
                className='p-2'
            />
        </div>
    </div>);
}

AgendaTypeAheadFilter.propTypes = {
    aggregations: PropTypes.object,
    filter: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
};

export default AgendaTypeAheadFilter;
