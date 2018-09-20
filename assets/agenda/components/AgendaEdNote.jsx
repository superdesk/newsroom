import React from 'react';
import PropTypes from 'prop-types';

export default function AgendaEdNote({item}) {
    if (!item.ednote) {
        return null;
    }

    return (
        <div className="wire-column__preview__editorial-note">
            <i className="icon-small--info icon--gray" />
            <span>{item.ednote}</span>
        </div>
    );
}

AgendaEdNote.propTypes = {
    item: PropTypes.object.isRequired,
};