import React from 'react';
import PropTypes from 'prop-types';
import {get, cloneDeep, uniqBy} from 'lodash';
import {gettext} from 'utils';

import NavGroup from './NavGroup';
import FilterItem from './FilterItem';

const LIMIT = 5;

const getVisibleBuckets = (buckets, group, toggleGroup) => {
    if (!buckets.length) {
        return;
    }

    let visibleBuckets = buckets;
    if (buckets.length > LIMIT && !group.isOpen) {
        visibleBuckets = buckets.slice(0, LIMIT).concat([
            <a key={'more'} onClick={(event) => toggleGroup(event, group)} className="small" href="">
                {gettext('Show more')}
            </a>
        ]);
    }

    if (buckets.length > LIMIT && group.isOpen) {
        visibleBuckets = buckets.concat([
            <a key={'less'} onClick={(event) => toggleGroup(event, group)} className="small" href="">
                {gettext('Show less')}
            </a>
        ]);
    }

    return visibleBuckets;
};


export default function FilterGroup({group, activeFilter, aggregations, toggleFilter, toggleGroup}) {
    const compareFunction = (a, b) => group.sorted ? -1 : String(a.key).localeCompare(String(b.key));

    const groupFilter = get(activeFilter, group.field, []);
    const activeBuckets = (get(activeFilter, group.field) || [])
        .map((filter) => ({key: filter}));
    const buckets = uniqBy(
        cloneDeep(get(aggregations, `${group.field}.buckets`) || group.buckets || [])
            .concat(activeBuckets),
        'key'
    )
        .sort(compareFunction)
        .map((bucket) => (
            <FilterItem
                key={bucket.key}
                bucket={bucket}
                group={group}
                toggleFilter={toggleFilter}
                groupFilter={groupFilter}
            />
        ));

    return (
        <NavGroup key={group.field} label={group.label}>
            {getVisibleBuckets(buckets, group, toggleGroup)}
        </NavGroup>
    );
}

FilterGroup.propTypes = {
    group: PropTypes.object,
    activeFilter: PropTypes.object,
    aggregations: PropTypes.object,
    toggleFilter: PropTypes.func.isRequired,
    toggleGroup: PropTypes.func.isRequired,
};
