import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaLongDescription({item}) {
    if (!item.definition_long && !item.definition_short) {
        return null;
    }

    return (
        <p className="wire-column__preview__text wire-column__preview__text--pre">
            {item.definition_long || item.definition_short}
        </p>
    );
}

AgendaLongDescription.propTypes = {
    item: PropTypes.object.isRequired,
};