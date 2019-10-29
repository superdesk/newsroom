import React from 'react';
import PropTypes from 'prop-types';

export default function FilterItem({bucket, group, toggleFilter, groupFilter}) {
    const isActive = groupFilter.indexOf(bucket.key) !== -1;

    return (
        <div className="custom-control custom-checkbox ui-dark">
            <input
                type="checkbox"
                className="custom-control-input"
                checked={isActive}
                id={bucket.key}
                onChange={() => {
                    toggleFilter(group.field, bucket.key, group.single, isActive);
                }} />
            <label
                className="custom-control-label"
                htmlFor={bucket.key}
            >
                {bucket.label || '' + bucket.key}
            </label>
        </div>
    );
}

FilterItem.propTypes = {
    bucket: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    groupFilter: PropTypes.array,
};
