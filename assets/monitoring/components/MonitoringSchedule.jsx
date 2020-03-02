import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import moment from 'moment';

import { gettext } from 'utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import SelectInput from 'components/SelectInput';

class MonitoringSchedule extends React.Component {
    constructor(props) {
        super(props);
        
        this.options = [
            {
                value: 'immediate',
                'text': gettext('Immediate')
            },
            {
                value: 'one_hour',
                'text': gettext('Hourly')
            },
            {
                value: 'two_hour',
                'text': gettext('Every Two Hours')
            },
            {
                value: 'four_hour',
                'text': gettext('Every Four Hours')
            },
            {
                value: 'daily',
                'text': gettext('Every day at')
            },
            {
                value: 'weekly',
                'text': gettext('Every week at')
            },
        ];

        this.days = [
            {
                value: 'mon',
                'text': gettext('Monday')
            },
            {
                value: 'tue',
                'text': gettext('Tuesday')
            },
            {
                value: 'wed',
                'text': gettext('Wednesday')
            },
            {
                value: 'thu',
                'text': gettext('Thursday')
            },
            {
                value: 'fri',
                'text': gettext('Friday')
            },
            {
                value: 'sat',
                'text': gettext('Saturday')
            },
            {
                value: 'sun',
                'text': gettext('Sunday')
            },
        ];

        this.onChangeSchedule = this.onChangeSchedule.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.onChangeDay = this.onChangeDay.bind(this);

        this.state = {needTime: this.getNeedTime(get(this.props, 'item.schedule.interval'))};
    }

    componentDidUpdate(prevPops) {
        if (get(this.props, 'item._id') !== get(prevPops, 'item._id')) {
            this.setState({ needTime: this.getNeedTime(get(this.props, 'item.schedule.interval')) });
        }
    }

    getNeedTime(option) {
        return ([this.options[3].value, this.options[4].value].includes(option));
    }

    onChangeSchedule(event) {
        const needTime = this.getNeedTime(event.target.value);
        if (needTime) {
            this.setState({ needTime: true });
            if (!get(this.props, 'item.schedule.time')) {
                this.onTimeChange(moment(), event.target.value);
                return;
            }
        } else if (this.state.needTime) {
            this.setState({ needTime: false });
        }

        this.props.onChange({
            target: {
                name: 'schedule',
                value: event.target.value ? {
                    interval: event.target.value,
                    time: needTime ? get(this.props.item, 'schedule.time') : null,
                    day: event.target.value === 'weekly' ? this.days[0].value : null,
                } : null
            }
        });
    }

    onTimeChange(date, schedule) {
        this.props.onChange({
            target: {
                name: 'schedule',
                value: {
                    interval: schedule || get(this.props.item, 'schedule.interval'),
                    time: date.format('HH:mm'),
                    day: get(this.props.item, 'schedule.day'),
                }
            }
        });
    }

    onChangeDay(event) {
        this.props.onChange({
            target: {
                name: 'schedule',
                value: event.target.value ? {
                    interval: get(this.props.item, 'schedule.interval'),
                    time: get(this.props.item, 'schedule.time'),
                    day: event.target.value,
                } : null
            }
        });

    }

    render() {
        const { item, onsaveMonitoringProfileSchedule, noForm, readOnly } = this.props;
        let timeValue = get(item, 'schedule.time');
        if (get(timeValue, 'length', 0) > 0) {
            timeValue = moment();
            timeValue.set({
                hour: parseInt(item.schedule.time.split(':')[0]),
                minute: parseInt(item.schedule.time.split(':')[1]),
            });
        }

        const ui = (
            <div>
                <SelectInput
                    name='schedule'
                    label={gettext('Schedule type')}
                    value={get(item, 'schedule.interval') || ''}
                    defaultOption={''}
                    options={this.options}
                    onChange={this.onChangeSchedule}
                    readOnly={readOnly} />
                {get(item, 'schedule.interval') === 'weekly' && <SelectInput
                    name='schedule.day'
                    label={gettext('Day of week')}
                    value={get(item, 'schedule.day') || ''}
                    options={this.days}
                    onChange={this.onChangeDay}
                    readOnly={readOnly} />}
                {this.state.needTime && (
                    <div className='form-group'>
                        <label htmlFor='schedule.time'>{gettext('Time')}</label>
                        <div className="field">
                            <DatePicker
                                value={timeValue.format('HH:mm')}
                                onChange={this.onTimeChange}
                                showTimeSelect
                                showTimeSelectOnly
                                timeCaption="Time"
                                dateFormat="HH:mm"
                                timeFormat="HH:mm" />
                        </div>
                    </div>
                )}
            </div>);

        return noForm ? ui : (
            <div className='tab-pane active' id='navigations'>
                <form>
                    <div className='list-item__preview-form'>
                        {ui}
                    </div>
                    <div className='list-item__preview-footer'>
                        <input
                            type='button'
                            className='btn btn-outline-primary'
                            value={gettext('Save')}
                            onClick={onsaveMonitoringProfileSchedule}
                        />
                    </div>
                </form>
            </div>
        );
    }
}

MonitoringSchedule.propTypes = {
    item: PropTypes.object,
    onsaveMonitoringProfileSchedule: PropTypes.func,
    onChange: PropTypes.func,
    noForm: PropTypes.bool,
    readOnly: PropTypes.bool,
};

export default MonitoringSchedule;
