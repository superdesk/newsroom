import React from 'react';
import PropTypes from 'prop-types';
import MoreNewsButton from './MoreNewsButton';
import moment from 'moment/moment';


const getEventPanel = (event, index) => {

    const getDateSpans = (d1, d2) => ([
        <span key='day' className='date-round__number'>{d1.format('D')} {!!d2 && ` - ${d2.format('D')}`}</span>,
        <span key='month' className='date-round__month'>{d1.format('MMMM')}</span>,
        <span key='weekday' className='date-round__day'>{!d2 && d1.format('dddd')}</span>,
    ]);

    const getDate = () => {
        if (!event.startDate) return;

        const startDate = moment(event.startDate);
        if (!event.endDate) {
            return (<div className='date-round__wrapper'>{getDateSpans(startDate)}
            </div>);
        }

        const endDate = moment(event.endDate);
        if (startDate.format('MMMM') === endDate.format('MMMM')) {
            return (<div className='date-round__wrapper'>
                {getDateSpans(startDate, endDate)}
            </div>);
        } else {
            return (<div className='date-round__wrapper'>
                {getDateSpans(startDate)}
                {getDateSpans(endDate)}
            </div>);
        }

    };

    return (<div className='col-sm-12 col-lg-6 d-flex mb-4' key={index}>
        <div className='card card--home'>
            {event.file_url && <img className='card-img-top' src={event.file_url} alt={event.headline} />}
            <div className='card-body card-body--two-columns card-body--green-border'>
                <div className='card-body__sidebar'>
                    <div className='date-round'>
                        {getDate()}
                    </div>
                </div>
                <div className='card-body__content'>
                    <h4 className='card-title'>{event.headline}</h4>
                    <div className='wire-articles__item__meta'>
                        <div className='wire-articles__item__meta-info'>
                            <span className='bold'>{event.location}</span>
                        </div>
                    </div>
                    <div className='wire-articles__item__text'>
                        <p className='card-text small'>{event.abstract}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};


function EventsTwoByTwoCard({events, title}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title}/>
            {events.map((event, index) => getEventPanel(event, index))}
        </div>
    );
}

EventsTwoByTwoCard.propTypes = {
    events: PropTypes.array,
    title: PropTypes.string,
};

export default EventsTwoByTwoCard;
