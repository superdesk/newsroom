import React from 'react';
import PropTypes from 'prop-types';
import {hasLocation, getEventLinks, getLocationString, getPublicContacts, getCalendars} from 'agenda/utils';


function AgendaPreviewMeta({item}) {
    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__meta-info'>
                {hasLocation(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--location icon--gray'></i>
                    <span>{getLocationString(item)}</span>
                </div>}
                {getPublicContacts(item).map((contact, index) => <div
                    className='wire-articles__item__meta-row'
                    key={`${contact.name}-${index}`}>
                    <i className='icon-small--user icon--gray'></i>
                    <span>{`${contact.name}${(contact.name && contact.organisation) ? ', ' : ''}${contact.organisation} ${contact.phone} ${contact.mobile} `}
                        {contact.email && <a href={`mailto:${contact.email}`} target="_blank">{contact.email}</a>}
                    </span>
                </div>)}
                {getEventLinks(item).map((link) => <div className='wire-articles__item__meta-row' key={link}>
                    <i className='icon-small--globe icon--gray'></i>
                    <span><a href={link} target="_blank">{link}</a></span>
                </div>)}
                {getCalendars(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--calendar icon--gray'></i>
                    <span>{getCalendars(item)}</span>
                </div>}
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
