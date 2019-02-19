import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import classNames from 'classnames';

export default function AgendaInternalNote({internalNote, onlyIcon, noMargin}) {

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
            <div className={classNames('wire-column__preview_article-note', {'m-0': noMargin})}>
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
