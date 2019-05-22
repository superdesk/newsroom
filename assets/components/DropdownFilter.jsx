import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import DropdownFilterButton from './DropdownFilterButton';

const compareFunction = (a, b) => String(a.key).localeCompare(String(b.key));

const processBuckets = (buckets, filter, toggleFilter) => buckets.sort(compareFunction).map((bucket) =>
    <button
        key={bucket.key}
        className='dropdown-item'
        onClick={() => toggleFilter(filter.field, bucket.key)}
    >{filter.transform ? filter.transform(bucket.key) : bucket.key}</button>);

function DropdownFilter({aggregations, filter, toggleFilter, activeFilter, getDropdownItems, getFilterLabel}) {
    return (<div className="btn-group" key={filter.field}>
        <DropdownFilterButton
            filter={filter}
            activeFilter={activeFilter}
            getFilterLabel={getFilterLabel}
        />
        <div className='dropdown-menu' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, null)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            {getDropdownItems(filter, aggregations, toggleFilter, processBuckets)}
        </div>
    </div>);
}

DropdownFilter.propTypes = {
    aggregations: PropTypes.object,
    filter: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
    getDropdownItems: PropTypes.func,
    getFilterLabel: PropTypes.func,
};

export default DropdownFilter;
