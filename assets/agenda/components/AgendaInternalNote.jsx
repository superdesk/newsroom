import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaInternalNote({internalNotes}) {

    if (!internalNotes || !internalNotes.length) {
        return null;
    }

    return (
        internalNotes.map((note, index) => (<div key={index} className="wire-column__preview__internal-note">
            <i className="icon-small--info icon--gray" />
            <span >{note}</span>
        </div>))
    );
}

AgendaInternalNote.propTypes = {
    internalNotes: PropTypes.array,
};