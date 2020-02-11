import React from 'react';
import PropTypes from 'prop-types';
import { get, isEmpty } from 'lodash';
import AgendaName from './AgendaName';
import AgendaMetaTime from './AgendaMetaTime';
import AgendaLocation from'./AgendaLocation';

const AgendaEventInfo = ({item, onClick}) => {
    const event = get(item, 'event');
    if (isEmpty(event)) {
        return null;
    }

    return (
        <div className='coverage-item' onClick={onClick}>
            <div className='coverage-item__row'>
                <AgendaName item={item} noMargin small/>
            </div>
            <div className='coverage-item__row wire-articles__item__meta-info m-0'>
                <AgendaMetaTime item={item} onlyDates />
            </div>
            <div className='coverage-item__row coverage-item__row--gray'>
                <AgendaLocation item={item} />
            </div>
        </div>
    );
};

AgendaEventInfo.propTypes = {
    item: PropTypes.object,
    onClick: PropTypes.func,
};

export default AgendaEventInfo;
