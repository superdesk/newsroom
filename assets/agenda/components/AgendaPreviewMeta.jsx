import React from 'react';
import PropTypes from 'prop-types';
import {getContactName,
    hasContact, hasLocation, getEventLink,
    hasEventLink, getContactEmail, getContactNumber, getLocationString} from 'agenda/utils';
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
                {hasContact(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--user icon--gray'></i>
                    <span>{`${getContactName(item)} ${getContactNumber(item)}`}
                        <a href={`mailto:${getContactEmail(item)}`}>{getContactEmail(item)}</a>
                    </span>
                </div>}
                {hasEventLink(item) && <div className='wire-articles__item__meta-row'>
                    <i className='icon-small--globe icon--gray'></i>
                    <span><a href={getEventLink(item)}>{getEventLink(item)}</a></span>
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
