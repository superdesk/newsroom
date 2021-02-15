import React from 'react';
import PropTypes from 'prop-types';

export function Source ({item}) {
    return <span>{item.source}</span>;
}

Source.propTypes = {
    item: PropTypes.object
};
