import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import classNames from 'classnames';

export default function AgendaInternalNote({internalNote, onlyIcon, noMargin, mt2}) {

    if (!internalNote) {
        return null;
    }

    const labelText = gettext('Internal Note');
    if (onlyIcon) {
        return (<div title={`${labelText}: ${internalNote}`}
            data-toggle="tooltip"
            data-placement="right">
            <i className="icon--info icon--red icon--info--smaller"/>
        </div>);
    } else {
        return (
            <div className={classNames('wire-column__preview_article-note', {'m-0': noMargin}, {'mt-2': mt2})}>
                <i className="icon--info icon--red icon--info--smaller" title={labelText}/>
                <span className='ml-1'>{internalNote}</span>
            </div>
        );
    }
}

AgendaInternalNote.propTypes = {
    internalNote: PropTypes.string,
    onlyIcon: PropTypes.bool,
    noMargin: PropTypes.bool,
    mt2: PropTypes.bool,
};
