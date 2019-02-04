import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatAgendaDate} from 'utils';

import AgendaListItemLabels from './AgendaListItemLabels';

export default function AgendaTime({item, group}) {
    const getDates = () => {
        const dates = formatAgendaDate(item, group);
        if (dates[1]) {
            return [<div key='time' className={bem('wire-column__preview', 'date', 'dashed-border')}>{dates[0]}</div>, dates[1]];
        }
        return dates[0];
    };
    
    return (
        <div className="wire-column__preview__content-header mb-2">
            <div className={bem('wire-column__preview', 'date', 'event')}>{getDates()}</div>
            <AgendaListItemLabels item={item} />
        </div>
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
    group: PropTypes.string,
};