import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import AgendaFilterButton from './AgendaFilterButton';


const getActiveTypeahead = (filter, activeFilter) => {
    return activeFilter[filter.field] ? activeFilter[filter.field][0] : [];
};

const processBuckets = (buckets) => buckets.map((bucket) => bucket.key).sort();

function AgendaTypeAheadFilter({aggregations, filter, toggleFilter, activeFilter, getDropdownItems}) {
    return (<div className="btn-group" key={filter.field}>
        <AgendaFilterButton
            filter={filter}
            activeFilter={activeFilter}
        />
        <div className='dropdown-menu dropdown-menu-typeahead' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, null)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            <Typeahead
                labelKey={filter.label}
                onChange={(selected) => toggleFilter(filter.field, selected.length ? selected : null)}
                options={getDropdownItems(filter, aggregations, toggleFilter, processBuckets)}
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
    getDropdownItems: PropTypes.func,
};

export default AgendaTypeAheadFilter;
