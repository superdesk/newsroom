import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import CalendarButtonWrapper from './CalendarButtonWrapper';

import 'react-datepicker/dist/react-datepicker.css';
import {EARLIEST_DATE} from '../utils';

class CalendarButton extends React.Component {
    constructor (props) {
        super(props);

        this.state = { startDate: moment(this.props.activeDate) };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(date) {
        this.props.selectDate(date.valueOf(), 'day');
        this.setState({ startDate: date });
    }

    componentDidUpdate(prevProps) {
        prevProps.activeDate === EARLIEST_DATE && this.setState({ startDate: moment(this.props.activeDate) });
    }

    render() {
        const isStartDateToday = moment.isMoment(this.state.startDate) && !this.state.startDate.isSame(moment(), 'day');
        const datePicker = (<DatePicker
            customInput={<CalendarButtonWrapper active={isStartDateToday}/>}
            dateFormat='dddd, MMMM D'
            todayButton={gettext('Today')}
            selected={this.state.startDate}
            onChange={this.handleChange}
            highlightDates={[moment()]}
            locale={window.locale || 'en'}
            popperModifiers={{
                offset: {
                    enabled: true,
                    offset: '5px, 10px'
                },
                preventOverflow: {
                    enabled: true,
                    escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
                    boundariesElement: 'viewport'
                }
            }}
        />);

        if (!this.props.label) {
            return datePicker;
        } else {
            return (<div className={this.props.labelClass}>
                <label className='pr-1'>{this.props.label}</label>
                {datePicker}
            </div>);

        }
    }
}


CalendarButton.propTypes = {
    selectDate: PropTypes.func,
    activeDate: PropTypes.number,
    label: PropTypes.string,
    labelClass: PropTypes.string,
};

export default CalendarButton;
