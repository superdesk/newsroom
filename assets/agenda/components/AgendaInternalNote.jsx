import React from 'react';
import PropTypes from 'prop-types';
import {getInternalNotes} from '../utils';

export default function AgendaInternalNote({item}) {
    const internalNotes = getInternalNotes(item);

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
    item: PropTypes.object.isRequired,
};