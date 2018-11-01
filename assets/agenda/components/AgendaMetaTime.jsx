import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {bem} from 'ui/utils';
import {formatTime, formatDate, gettext, DAY_IN_MINUTES} from 'utils';
import {hasCoverages} from '../utils';

function format(agendaDate) {
    const start = moment(agendaDate.start);
    const end = moment(agendaDate.end);
    const duration = end.diff(start, 'minutes');

    if (duration > DAY_IN_MINUTES) {
        // Multi day event
        return ([
            <span key="start">{formatTime(start)} <u>{formatDate(start)}</u></span>,
            <span key="dash">{' - '}</span>,
            <span key="end">{formatTime(end)} <u>{formatDate(end)}</u></span>
        ]);
    }

    if (duration == DAY_IN_MINUTES) {
        // All day event
        return gettext('ALL DAY');
    }

    if (duration == 0) {
        // start and end times are the same
        return `${formatTime(start)}`;
    }

    // single day event
    return `${formatTime(start)} - ${formatTime(end)}`;
}

function getCalendarClass(item) {
    if (item.state === 'rescheduled') {
        return 'icon--orange';
    }

    if (item.state === 'cancelled') {
        return 'icon--red';
    }

    if (hasCoverages(item)) {
        return 'icon--green';
    } else {
        return 'icon--gray';
    }
}

export default function AgendaMetaTime({item, borderRight, isRecurring}) {
    return ([
        <div key="icon" className={bem('wire-articles__item', 'icons','dashed-border')}>
            <span className="wire-articles__item__icon">
                <i className={`icon--calendar ${getCalendarClass(item)}`}></i>
                {isRecurring && <span className="time-icon"><i className="icon-small--repeat"></i></span>}
            </span>
        </div>,
        <div key="times" className={bem('wire-articles__item', 'meta-time', {'border-right': borderRight})}>
            {format(item.dates)}
        </div>
    ]);
}

AgendaMetaTime.propTypes = {
    item: PropTypes.object,
    borderRight: PropTypes.bool,
    isRecurring: PropTypes.bool,
};

AgendaMetaTime.defaultProps = {
    isRecurring: false,
    hasCoverage: false
};
