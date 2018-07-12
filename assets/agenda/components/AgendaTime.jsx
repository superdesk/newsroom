import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatTime } from 'utils';
import { bem } from 'ui/utils';

import { isRecurring } from '../utils';
import AgendaListItemLabels from './AgendaListItemLabels';

export default function AgendaTime({item}) {
    return (
        <div className="wire-column__preview__content-header mb-2">
            <div className="wire-articles__item__meta-time">
                <span className="time-label">{formatTime(item.dates.start)}</span>
                {isRecurring(item) && <span className="time-icon"><i className="icon-small--repeat" /></span>}
            </div>
            <div className={bem('wire-column__preview', 'date', 'event')}>{formatDate(item.dates.start)}</div>
            <AgendaListItemLabels item={item} />
        </div>
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
};