import React from 'react';
import PropTypes from 'prop-types';
import {hasLocation, getEventLinks, getLocationString, getPublicContacts} from 'agenda/utils';
// import {formatTime, fullDate, isToday} from 'utils';


function AgendaPreviewMeta({item}) {
    // const dates = [item.dates.start, item.dates.end !== item.dates.start ? item.dates.end : null]
    //     .filter((d) => !!d)
    //     .map((date) => isToday(date) ? formatTime(date) : fullDate(date));

    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__meta-info'>
                {hasLocation(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--location icon--gray'></i>
                    <span>{getLocationString(item)}</span>
                </div>}
                {/*<div className='wire-articles__item__meta-row'>*/}
                {/*<span><i className='icon-small--clock icon--gray'></i>*/}
                {/*{dates.join(' - ')}*/}
                {/*</span>*/}
                {/*</div>*/}
                {getPublicContacts(item).map((contact, index) => <div
                    className='wire-articles__item__meta-row'
                    key={`${contact.name}-${index}`}>
                    <i className='icon-small--user icon--gray'></i>
                    <span>{`${contact.name}${(contact.name && contact.organisation) ? ', ' : ''}${contact.organisation} ${contact.phone} ${contact.mobile} `}
                        {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
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
