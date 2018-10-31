import React from 'react';
import PropTypes from 'prop-types';

import {gettext, shortDate} from 'utils';
import CloseButton from './CloseButton';


const getAgendaNotification = (item) => [
    <div key='message' className="notif__list__info">{gettext('An event you are watching has been updated')}</div>,
    <div key='name' className="notif__list__headline">
        <a href={`/agenda?item=${item._id}`} >{item.name}</a>
    </div>];

const getWireNotification = (item) => [
    <div key='message' className="notif__list__info">{gettext('A story you downloaded has been updated')}</div>,
    <div key='name' className="notif__list__headline">
        <a href={`/wire?item=${item._id}`} >{item.headline}</a>
    </div>];

function NotificationListItem({item, clearNotification}) {
    
    return (
        <div key={item._id} className='notif__list__item'>
            <CloseButton onClick={() => clearNotification(item._id)}/>
            {item.type === 'text' ? getWireNotification(item) : getAgendaNotification(item)}
            <div className='wire-articles__item__meta-info'>
                {gettext('Created on')} {shortDate(item.versioncreated)}
            </div>
        </div>);
   
}

NotificationListItem.propTypes = {
    item: PropTypes.object,
    clearNotification: PropTypes.func,
};

export default NotificationListItem;
