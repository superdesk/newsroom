import React from 'react';
import PropTypes from 'prop-types';
import AgendaDateButtons from './AgendaDateButtons';
import CalendarButton from '../../components/CalendarButton';


function AgendaDateNavigation({selectDate, activeDate, activeGrouping, displayCalendar}) {
    return (<div className='d-none d-lg-flex align-items-center mr-3'>
        {displayCalendar && <CalendarButton selectDate={selectDate} activeDate={activeDate} />}

        {!displayCalendar && <AgendaDateButtons
            selectDate={selectDate} activeDate={activeDate} activeGrouping={activeGrouping}/>}
    </div>);
}

AgendaDateNavigation.propTypes = {
    selectDate: PropTypes.func,
    activeDate: PropTypes.number,
    activeGrouping: PropTypes.string,
    displayCalendar: PropTypes.bool,
};

export default AgendaDateNavigation;
