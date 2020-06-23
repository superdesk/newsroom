import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import {get} from 'lodash';

import {isPostponed, isRescheduled, isCanceled} from '../utils';
import {DATE_FORMAT, formatDate} from 'utils';
import {gettext} from '../../utils';

function AgendaListItemLabels({item, withDate, group, right}) {
    const getLabel = () => {
        let labelText;
        if (isPostponed(item)) {
            labelText = gettext('postponed');
        }

        if (isCanceled(item)) {
            labelText = gettext('cancelled');
        }

        if (isRescheduled(item)) {
            labelText = gettext('rescheduled');
        }

        if (get(item, 'event.completed')) {
            labelText = gettext('event completed');
        }

        if (!labelText) {
            return null;
        }

        return (<div><span className={classNames('label label--orange ml-2', {'pull-right': right})}>{labelText}</span></div>);
        
    };

    if (!withDate) {
        return getLabel();
    }

    const dateGroup = group ? moment(group, DATE_FORMAT) : moment(get(item, 'dates.start'));
   
    return (<div className='wire-column__preview__date wire-column__preview__date--event p-0'>
        {formatDate(dateGroup)}{getLabel()}
    </div>);
}

AgendaListItemLabels.propTypes = {
    item: PropTypes.object,
    withDate: PropTypes.bool,
    group: PropTypes.string,
    right: PropTypes.bool,
};

export default AgendaListItemLabels;
