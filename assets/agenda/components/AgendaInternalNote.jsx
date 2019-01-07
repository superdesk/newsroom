import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaInternalNote({internalNote}) {

    if (!internalNote) {
        return null;
    }

    return (
        <div className="wire-column__preview__internal-note">
            <i className="icon-small--info icon--gray" />
            <span >{internalNote}</span>
        </div>
    );
}

AgendaInternalNote.propTypes = {
    internalNote: PropTypes.string,
};