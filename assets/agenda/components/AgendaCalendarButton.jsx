import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';
import {EARLIEST_DATE} from '../utils';

class AgendaCalendarButtonWrapper extends React.Component {
    render() {
        return (
            <button
                className='btn btn-outline-primary btn-sm mr-3'
                onClick={this.props.onClick}
            >
                {this.props.value}
            </button>
        );
    }
}

AgendaCalendarButtonWrapper.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
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
        return (<DatePicker
            customInput={<AgendaCalendarButtonWrapper />}
            dateFormat='dddd, D MMMM'
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
