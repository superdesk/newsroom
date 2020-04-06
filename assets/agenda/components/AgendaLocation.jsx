import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {hasLocation, getLocationString} from '../utils';

export default function AgendaLocation({item, isMobilePhone, border}) {
    if  (!hasLocation(item)) {
        return null;
    }

    return (
        <Fragment>
            <span className='mr-2'>
                <i className='icon-small--location icon--gray' />
            </span>

            {isMobilePhone ? (
                <span>{getLocationString(item)}</span>
            ) : (
                <span className={classNames('mr-2',
                    {'wire-articles__item__icons--dashed-border': border})}>
                    {getLocationString(item)}
                </span>
            )}
        </Fragment>
    );
}

AgendaLocation.propTypes = {
    item: PropTypes.object.isRequired,
    isMobilePhone: PropTypes.bool,
    border: PropTypes.bool,
};