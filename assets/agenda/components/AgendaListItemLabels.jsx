import React from 'react';
import PropTypes from 'prop-types';
import {isPostponed, isRescheduled, isCanceled} from '../utils';
import {gettext} from '../../utils';

function AgendaListItemLabels({item}) {
    const getLabel = () => {
        if (isPostponed(item)) return (<span className='label label--orange ml-4'>{gettext('postponed')}</span>);
        if (isCanceled(item)) return (<span className='label label--red ml-4'>{gettext('cancelled')}</span>);
        if (isRescheduled(item)) return (<span className='label label--green-dark ml-4'>{gettext('rescheduled')}</span>);
        return null;
    };

    return getLabel();
}

AgendaListItemLabels.propTypes = {
    item: PropTypes.object,
};

export default AgendaListItemLabels;
