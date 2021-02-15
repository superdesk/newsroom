import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

export function VersionType({value}) {
    return (
        <span>{gettext('Version type: {{version}}', {version: value})}</span>
    );
}

VersionType.propTypes = {
    value: PropTypes.string,
};
