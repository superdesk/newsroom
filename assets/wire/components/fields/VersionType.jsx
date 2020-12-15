import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

export function VersionType({item}) {
    return <span>{item.source}</span>;
}

VersionType.propTypes = {
    item: PropTypes.object,
};

