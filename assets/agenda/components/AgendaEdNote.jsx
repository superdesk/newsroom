import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import classNames from 'classnames';

import {gettext} from 'utils';

export default function AgendaEdNote({item, plan, secondaryNoteField, noMargin}) {
    // We display Secondary Note only from 'item' for now
    const displaySecondaryNote = secondaryNoteField && get(item, secondaryNoteField);
    if (!item.ednote && !plan.ednote && !displaySecondaryNote) {
        return null;
    }

    const tooltip = !item.ednote && !plan.ednote ? gettext('Reason') : gettext('Editorial Note');
    const getMultiLineNote = (note) => (note && note.split('\n').map((t, key) =>
        <span key={key}>{t}<br/></span>)
    );
    const getNoteFields = () => {
        if (!item.ednote && !plan.ednote) {
            // Display only Secondary Note
            return (<span className='ml-1'>{getMultiLineNote(item[secondaryNoteField])}</span>);
        }

        // Display both Ed & Secondary Note
        return (
            <span className='ml-1'>{getMultiLineNote(get(plan, 'ednote') || item.ednote)}
                <span className="secondary-note">
                    {getMultiLineNote(item[secondaryNoteField])}
                </span>
            </span>
        );
    };

    return (
        <div className={classNames('wire-column__preview_article-note', {'m-0': noMargin})}>
            <i className="icon--info icon--info--smaller" title={tooltip}/>
            {getNoteFields()}
        </div>
    );
}

AgendaEdNote.propTypes = {
    item: PropTypes.object.isRequired,
    plan: PropTypes.object,
    secondaryNoteField: PropTypes.string,
    noMargin: PropTypes.bool,
};