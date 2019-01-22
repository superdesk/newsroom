import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import {gettext} from 'utils';

export default function AgendaEdNote({item, plan, secondaryNoteField}) {
    // We display Secondary Note only from 'item' for now
    const displaySecondaryNote = secondaryNoteField && get(item, secondaryNoteField);
    if (!item.ednote && !plan.ednote && !displaySecondaryNote) {
        return null;
    }

    const getNoteFields = () => {
        if (!item.ednote && !plan.ednote) {
            // Display only Secondary Note
            return (<span>{item[secondaryNoteField]}</span>);
        }

        // Display both Ed & Secondary Note
        return (
            <span>{plan.ednote || item.ednote}
                <span className="secondary-note">
                    {item[secondaryNoteField]}
                </span>
            </span>
        );
    };

    return (
        <div className="wire-column__preview_article-note">
            <i className="icon-small--info" />
            <label>{gettext('Ed Note:')}&nbsp;&nbsp;</label>
            {getNoteFields()}
        </div>
    );
}

AgendaEdNote.propTypes = {
    item: PropTypes.object.isRequired,
    plan: PropTypes.object,
    secondaryNoteField: PropTypes.string,
};