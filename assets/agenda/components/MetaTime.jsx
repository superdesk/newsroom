import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatTime} from 'utils';
import {hasCoverages, isRecurring} from '../utils';

export default function MetaTime({item, borderRight}) {
    return (
        <div className={bem('wire-articles__item', 'meta-time', {'border-right': borderRight})}>
            <span className={bem('time-label', null, {covering: hasCoverages(item)})}>{formatTime(item.dates.start)}</span>
            {isRecurring(item) && <span className='time-icon'><i className='icon-small--repeat'></i></span>}
        </div>
    );
}

MetaTime.propTypes = {
    item: PropTypes.shape({
        dates: PropTypes.object,
    }).isRequired,
    borderRight: PropTypes.bool,
};