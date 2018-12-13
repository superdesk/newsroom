import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaEdNote({item, plan}) {
    if (!item.ednote && !plan.ednote) {
        return null;
    }

    return (
        <div className="wire-column__preview__editorial-note">
            <i className="icon-small--info icon--gray" />
            <span>{plan.ednote || item.ednote}</span>
        </div>
    );
}

AgendaEdNote.propTypes = {
    item: PropTypes.object.isRequired,
    plan: PropTypes.object,
};