import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { get } from 'lodash';
import classNames from 'classnames';

import {bem} from 'ui/utils';
import {formatAgendaDate} from 'utils';

export default function AgendaTime({item, group, suppliedNodes}) {
    const startDateInRemoteTZ = moment.tz(moment(item.dates.start).utc(), item.dates.tz);
    const isRemoteTimezone = get(item, 'dates.tz') &&
        moment.tz(moment.tz.guess()).format('Z') !== startDateInRemoteTZ.format('Z');
    const getDates = (remoteTz = false) => {
        let dates;
        if (remoteTz) {
            const new_dates = {
                dates: {
                    start: startDateInRemoteTZ,
                    end: moment.tz(moment(item.dates.end).utc(), item.dates.tz),
                    tz: item.dates.tz,
                }
            };
            dates = formatAgendaDate(new_dates, group, false);
        } else {
            dates = formatAgendaDate(item, group);
        }

        if (suppliedNodes && !remoteTz) {
            return [(<div key='time' className={bem('wire-column__preview', 'date', 'dashed-border')}>
                {dates[1]} {dates[0]}</div>)];
        }

        return [dates[1], dates[0]];
    };
    const remoteTZNode = () => {return !isRemoteTimezone ? null :
        (<div key='remote-time' className={bem('wire-column__preview', 'date', 'event')}>{getDates(true)}</div>);};
    
    return (
        [(<div key='local-time' className={classNames('wire-column__preview__content-header mb-2')}>
            <div className={classNames(bem('wire-column__preview', 'date', 'event'),
                {'p-0': isRemoteTimezone})}>{getDates()}</div>
            {suppliedNodes}
        </div>),
        remoteTZNode()]
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
    group: PropTypes.string,
    suppliedNodes: PropTypes.node,
};