import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatTime} from 'utils';

export default function MetaTime({date, borderRight, isRecurring, hasCoverages}) {
    return (
        <div className={bem('wire-articles__item', 'meta-time', {'border-right': borderRight})}>
            <span className={bem('time-label', null, {covering: hasCoverages})}>{formatTime(date)}</span>
            {isRecurring && <span className='time-icon'><i className="icon-small--repeat"/></span>}
        </div>
    );
}

MetaTime.propTypes = {
    date: PropTypes.string,
    borderRight: PropTypes.bool,
    isRecurring: PropTypes.bool,
    hasCoverages: PropTypes.bool,
};

MetaTime.defaultProps = {
    isRecurring: false,
    hasCoverage: false
};
