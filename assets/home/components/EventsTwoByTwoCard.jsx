import React from 'react';
import PropTypes from 'prop-types';
import MoreNewsButton from './MoreNewsButton';
import moment from 'moment/moment';
import { gettext } from 'utils';


const getEventPanel = (event, index) => {

    const isSameMonth = (d1, d2) => !!d2 && d1.format('MMMM') === d2.format('MMMM');

    const isDifferentMonth = (d1, d2) => !!d2 && d1.format('MMMM') !== d2.format('MMMM');

    // Checks if the date range is for the whole month
    const isWholeMonth = (d1, d2) => {
        if (!d2) {
            return false;
        }
        let date1 = moment(d1), date2 = moment(d2);
        return date1.format('MMMM') === date2.format('MMMM') &&
          date1.format('MMMM') !== date2.add(1, 'days').format('MMMM') &&
          date1.add(-1, 'days').format('MMMM') !== date2.format('MMMM');
    };

    const getDateSpans = (d1, d2) => ([
        isWholeMonth(d1, d2) ? <div key='day' className='date-round__number'><span>{gettext('all')}</span></div> :
            <div key='day' className='date-round__number'>
                <span>{d1.format('D')}</span>{isSameMonth(d1, d2) && '-'}<span>{isSameMonth(d1, d2) && d2.format('D')}</span>
            </div>,
        <div key='month' className='date-round__month date-round__month--big'><span>{d1.format('MMMM')}</span></div>,
        isDifferentMonth(d1, d2) ?
            <div key='month2' className='date-round__month'>
                {gettext('to')} <span className='date-round__number--small'>{d2.format('D')}</span>  <span>{d2.format('MMMM')}</span>
            </div> : null,
    ]);

    const getDate = () => {
        if (!event.startDate) return;

        const startDate = moment(event.startDate);
        const endDate = event.endDate ? moment(event.endDate) : null;

        return (<div className='date-round__wrapper'>{getDateSpans(startDate, endDate)}</div>);
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
                        <div className="wire-articles__item__icons">
                            <span className="wire-articles__item__icon">
                                <i className="icon--calendar icon--gray-light"></i>
                            </span>
                        </div>
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
