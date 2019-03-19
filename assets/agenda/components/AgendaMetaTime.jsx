import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import AgendaItemTimeUpdater from './AgendaItemTimeUpdater';
import {bem} from 'ui/utils';
import {formatTime, formatDate, DATE_FORMAT, gettext, getScheduleType} from 'utils';
import {hasCoverages, isCoverageForExtraDay, SCHEDULE_TYPE} from '../utils';

function format(item, group) {
    let start = moment(item.dates.start);
    let end = moment(item.dates.end);
    let duration = end.diff(start, 'minutes');
    let groupDate = moment(group, DATE_FORMAT);

    const isGroupBetweenEventDates = start.isSameOrBefore(groupDate, 'day') && end.isSameOrAfter(groupDate, 'day');

    function timeElement(start, end, key) {
        if (!end) {
            return (<span className='time-text mr-2' key={key}>{formatTime(start)}</span>);
        }

        return <span key={key} className='time-text mr-2'>{formatTime(start)} - {formatTime(end)}</span>;
    }

    function dateElement(date) {
        return (<span key='date'>{formatDate(date)}</span>);
    }

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
            start = moment(scheduleDates[0]);
        }
    }

    const scheduleType = getScheduleType(item);

    if (duration === 0 || scheduleType === SCHEDULE_TYPE.NO_DURATION) {
        return ([timeElement(start, null, 'start'), dateElement(start)]);
    } else {
        switch(scheduleType) {
        case SCHEDULE_TYPE.MULTI_DAY:
            return ([
                <span key="start">{timeElement(start)}{dateElement(start)}</span>,
                <span key="dash" className='ml-2 mr-2'>{(gettext('to'))}</span>,
                <span key="end">{timeElement(end)}{dateElement(end)}</span>
            ]);

        case SCHEDULE_TYPE.ALL_DAY:
            return dateElement(start);

        case SCHEDULE_TYPE.REGULAR:
            return ([timeElement(start, end, 'times'), dateElement(start)]);
        }
    }
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
