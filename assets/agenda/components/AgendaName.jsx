import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaName({item}) {
    return (
        <h2 className="wire-column__preview__headline">{item.name || item.headline}</h2>
    );
}

AgendaName.propTypes = {
    item: PropTypes.object.isRequired,
};