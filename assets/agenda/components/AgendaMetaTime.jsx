import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';

import AgendaItemTimeUpdater from './AgendaItemTimeUpdater';
import {bem} from 'ui/utils';
import {formatTime, formatDate, DATE_FORMAT, gettext, getScheduleType} from 'utils';
import {hasCoverages, isCoverageForExtraDay, SCHEDULE_TYPE, isItemTBC, TO_BE_CONFIRMED_TEXT} from '../utils';

function format(item, group, onlyDates) {
    let start = moment(item.dates.start);
    let end = moment(item.dates.end);
    let duration = end.diff(start, 'minutes');
    let groupDate = moment(group, DATE_FORMAT);

    const isGroupBetweenEventDates = start.isSameOrBefore(groupDate, 'day') && end.isSameOrAfter(groupDate, 'day');
    const isTBCItem = isItemTBC(item);
    const tbcStr = ` (${TO_BE_CONFIRMED_TEXT})`;

    function timeElement(start, end, key) {
        let value = end ? `${formatTime(start)} - ${formatTime(end)}` : formatTime(start);
        if (onlyDates) {
            return (<span className="mr-2 border-right pr-2" key={key}>{value}</span>);
        }

        return (<span className="time-text mr-2" key={key}>{value}</span>);
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
        return isTBCItem ? ([dateElement(start), tbcStr]) :
            ([timeElement(start, null, 'start'), dateElement(start)]);
    } else {
        switch(scheduleType) {
        case SCHEDULE_TYPE.MULTI_DAY:
            return isTBCItem ? ([
                <span key="start">{dateElement(start)}{tbcStr}</span>,
                <span key="dash" className='ml-2 mr-2'>{(gettext('to'))}</span>,
                <span key="end">{dateElement(end)}{tbcStr}</span>
            ]) :
                ([
                    <span key="start">{timeElement(start)}{dateElement(start)}</span>,
                    <span key="dash" className='ml-2 mr-2'>{(gettext('to'))}</span>,
                    <span key="end">{timeElement(end)}{dateElement(end)}</span>
                ]);

        case SCHEDULE_TYPE.ALL_DAY:
            return dateElement(start);

        case SCHEDULE_TYPE.REGULAR:
            return isTBCItem ?  ([dateElement(start), tbcStr])
                : ([timeElement(start, end, 'times'), dateElement(start)]);
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

export default function AgendaMetaTime({item, borderRight, isRecurring, group, isMobilePhone, onlyDates}) {
    const times = (
        <div key="times" className={classNames(
            bem('wire-articles__item', 'meta-time', {'border-right': borderRight}),
            {'w-100': isMobilePhone},
            {'m-0': onlyDates})}>
            {format(item, group, onlyDates)}
        </div>
    );

    if (onlyDates) {
        return times;
    }

    const icons = (
        <div key="icon" className={bem('wire-articles__item', 'icons',{'dashed-border': !isMobilePhone})}>
            <span className={classNames(
                'wire-articles__item__icon',
                {'dashed-border': isMobilePhone}
            )}>
                <i className={`icon--calendar ${getCalendarClass(item)}`} />
                {isRecurring && <span className="time-icon"><i className="icon-small--repeat" /></span>}
            </span>
        </div>
    );

    return isMobilePhone ?
        [times, icons] :
        [icons, times, <AgendaItemTimeUpdater key="timeUpdate" item={item} borderRight={borderRight} />];
}

AgendaMetaTime.propTypes = {
    item: PropTypes.object,
    borderRight: PropTypes.bool,
    isRecurring: PropTypes.bool,
    group: PropTypes.string,
    isMobilePhone: PropTypes.bool,
    onlyDates: PropTypes.bool,
};

AgendaMetaTime.defaultProps = {
    isRecurring: false,
    hasCoverage: false,
    isMobilePhone: false,
    borderRight: false,
};
