import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

export default function AgendaInternalNote({internalNote, onlyIcon}) {

    if (!internalNote) {
        return null;
    }

    const labelText = gettext('Internal Note:');
    if (onlyIcon) {
        return (<div title={`${labelText} ${internalNote}`}
            data-toggle="tooltip"
            data-placement="right">
            <i className="icon-small--info icon--red"/>
        </div>);
    } else {
        return (
            <div className="wire-column__preview_article-note">
                <i className="icon-small--info icon--red" />
                <label>{labelText}&nbsp;&nbsp;</label>
                <span >{internalNote}</span>
            </div>
        );
    }
}

AgendaInternalNote.propTypes = {
    internalNote: PropTypes.string,
    onlyIcon: PropTypes.bool,
};
