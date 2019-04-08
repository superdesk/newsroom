import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import classNames from 'classnames';

import 'react-datepicker/dist/react-datepicker.css';
import {EARLIEST_DATE} from '../utils';

class AgendaCalendarButtonWrapper extends React.Component {
    render() {
        return (
            <button className={
                classNames('btn btn-outline-primary btn-sm mr-3 align-items-center px-2 btn-with-icon', {'active': this.props.active})}
            onClick={this.props.onClick}>
                {this.props.value}
                <i className={classNames('icon-small--arrow-down ml-1', {'icon--white': this.props.active})}></i>
            </button>
        );
    }
}

AgendaCalendarButtonWrapper.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    active: PropTypes.bool,
};



class AgendaCalendarButton extends React.Component {
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
        return (<DatePicker
            customInput={<AgendaCalendarButtonWrapper active={isStartDateToday}/>}
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
    }
}


AgendaCalendarButton.propTypes = {
    selectDate: PropTypes.func,
    activeDate: PropTypes.number,
};

export default AgendaCalendarButton;
