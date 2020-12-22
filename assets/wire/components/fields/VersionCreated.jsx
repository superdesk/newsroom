import React from 'react';
import PropTypes from 'prop-types';
import {fullDate} from 'utils';

export function VersionCreated ({item}) {
    return (
        <time
            dateTime={fullDate(
                item.versioncreated
            )}
        >
            {fullDate(item.versioncreated)}
        </time>
    );
}

VersionCreated.propTypes = {
    item: PropTypes.object
};
