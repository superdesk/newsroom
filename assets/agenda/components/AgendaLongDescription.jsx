import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';


export default function AgendaLongDescription({item, plan}) {
    if (!get(plan, 'description_text') && !item.definition_long && !item.definition_short) {
        return null;
    }

    return (
        <p className="wire-column__preview__text wire-column__preview__text--pre">
            {get(plan, 'description_text') || item.definition_long || item.definition_short}
        </p>
    );
}

AgendaLongDescription.propTypes = {
    item: PropTypes.object.isRequired,
    plan: PropTypes.object,
};