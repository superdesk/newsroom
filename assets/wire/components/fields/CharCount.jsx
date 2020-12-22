import React from 'react';
import PropTypes from 'prop-types';
import {characterCount, gettext} from 'utils';

export function CharCount ({item}) {
    return <span>{characterCount(item)} {gettext('characters')}</span>;
}

CharCount.propTypes = {
    item: PropTypes.object
};

