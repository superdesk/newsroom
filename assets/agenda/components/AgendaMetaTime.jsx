import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import AgendaItemTimeUpdater from './AgendaItemTimeUpdater';
import {bem} from 'ui/utils';
import {formatTime, formatDate, DAY_IN_MINUTES, DATE_FORMAT} from 'utils';
import {hasCoverages, isCoverageForExtraDay} from '../utils';

function format(item, group) {
    let start = moment(item.dates.start);
    let end = moment(item.dates.end);
    let duration = end.diff(start, 'minutes');
    let groupDate = moment(group, DATE_FORMAT);

    const isGroupBetweenEventDates = start.isSameOrBefore(groupDate, 'day') && end.isSameOrAfter(groupDate, 'day');

    if (!isGroupBetweenEventDates && hasCoverages(item)) {
        // we rendering for extra days
        const scheduleDates = item.coverages
            .map((coverage) => {
                if (isCoverageForExtraDay(coverage, group)) {
                    return coverage.scheduled;
                }
                return null;
            })
            .filter((d) => d)
            .sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            })
        ;
        if (scheduleDates.length > 0) {
            duration = 0;
            start = scheduleDates[0];
        }
    }

    if (duration > DAY_IN_MINUTES) {
        // Multi day event
        return ([
            <span key="start"><span className='time-text'>{formatTime(start)}</span> {formatDate(start)}</span>,
            <span key="dash">{' - '}</span>,
            <span key="end"><span className='time-text'>{formatTime(end)}</span> {formatDate(end)}</span>
        ]);
    }

    if (duration == DAY_IN_MINUTES) {
        // All day event
        return (<span>{formatDate(start)}</span>);
    }

    if (duration == 0) {
        // start and end times are the same
        return ([<span key="start" className='time-text'>{formatTime(start)}</span>,` ${formatDate(start)}`]);
    }

    // single day event
    return ([<span key="times" className='time-text'>{formatTime(start)} - {formatTime(end)}</span>,` ${formatDate(start)}`]);
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

export default function AgendaMetaTime({item, borderRight, isRecurring, group}) {
    return ([
        <div key="icon" className={bem('wire-articles__item', 'icons','dashed-border')}>
            <span className="wire-articles__item__icon">
                <i className={`icon--calendar ${getCalendarClass(item)}`}></i>
                {isRecurring && <span className="time-icon"><i className="icon-small--repeat"></i></span>}
            </span>
        </div>,
        <div key="times" className={bem('wire-articles__item', 'meta-time', {'border-right': borderRight})}>
            {format(item, group)}
        </div>,
        <AgendaItemTimeUpdater key="timeUpdate" item={item} borderRight={borderRight} />
    ]);
}

AgendaMetaTime.propTypes = {
    item: PropTypes.object,
    borderRight: PropTypes.bool,
    isRecurring: PropTypes.bool,
    group: PropTypes.string,
};

AgendaMetaTime.defaultProps = {
    isRecurring: false,
    hasCoverage: false
};
