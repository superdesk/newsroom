import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {gettext} from 'utils';
import DropdownFilterButton from './DropdownFilterButton';

const compareFunction = (a, b) => String(a.key).localeCompare(String(b.key));

const processBuckets = (buckets, filter, toggleFilter) => (filter.notSorted ? buckets : buckets.sort(compareFunction)).map(
    (bucket, index) =>
        bucket.key === 'divider' ?
            <div className="dropdown-divider" key={index}/> :
            <button
                key={bucket.key}
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, bucket.key)}
            >{filter.transform ? filter.transform(bucket.key, bucket) : bucket.key}</button>);

function DropdownFilter({
    aggregations,
    filter,
    toggleFilter,
    activeFilter,
    getDropdownItems,
    getFilterLabel,
    className,
    ...props}) {
    return (<div className={classNames(
        'btn-group',
        {[className]: className}
    )} key={filter.field}>
        <DropdownFilterButton
            filter={filter}
            activeFilter={activeFilter}
            getFilterLabel={getFilterLabel}
            {...props}
        />
        <div className='dropdown-menu' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, null)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            {getDropdownItems(filter, aggregations, toggleFilter, processBuckets, {...props})}
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
    className: PropTypes.string,
};

export default DropdownFilter;
