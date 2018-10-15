import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatAgendaDate} from 'utils';

import AgendaListItemLabels from './AgendaListItemLabels';

export default function AgendaTime({item, group}) {
    return (
        <div className="wire-column__preview__content-header mb-2">
            <div className={bem('wire-column__preview', 'date', 'event')}>{formatAgendaDate(item.dates, group)}</div>
            <AgendaListItemLabels item={item} />
        </div>
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
    group: PropTypes.string,
};