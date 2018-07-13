import React from 'react';
import PropTypes from 'prop-types';
import {hasLocation, getEventLinks, getLocationString, getPublicContacts} from 'agenda/utils';
import {formatTime} from 'utils';


function AgendaPreviewMeta({item}) {
    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__meta-info'>
                {hasLocation(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--location icon--gray'></i>
                    <span>{getLocationString(item)}</span>
                </div>}
                <div className='wire-articles__item__meta-row'>
                    <span><i className='icon-small--clock icon--gray'></i>
                        {`${formatTime(item.dates.start)} - ${formatTime(item.dates.end)}`}</span>
                </div>
                {getPublicContacts(item).map((contact) => <div
                    className='wire-articles__item__meta-row'
                    key={contact.name}>
                    <i className='icon-small--user icon--gray'></i>
                    <span>{`${contact.name} ${contact.phones || contact.mobiles}`}
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </span>
                </div>)}
                {getEventLinks(item).map((link) => <div className='wire-articles__item__meta-row' key={link}>
                    <i className='icon-small--globe icon--gray'></i>
                    <span><a href={link}>{link}</a></span>
                </div>)}
            </div>
        </div>
    );
}

AgendaPreviewMeta.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
    inputRef: PropTypes.string,
};

export default AgendaPreviewMeta;
