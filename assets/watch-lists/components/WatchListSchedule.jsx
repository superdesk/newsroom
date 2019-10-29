import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import moment from 'moment';

import { gettext } from 'utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import SelectInput from 'components/SelectInput';

class WatchListSchedule extends React.Component {
    constructor(props) {
        super(props);
        
        this.options = [
            {
                value: 'immediate',
                'text': gettext('Immediate')
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

        this.onChangeSchedule = this.onChangeSchedule.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);

        this.state = {needTime: this.getNeedTime(get(this.props, 'watchList.schedule.interval'))};
    }

    componentDidUpdate(prevPops) {
        if (get(this.props, 'watchList._id') !== get(prevPops, 'watchList._id')) {
            this.setState({ needTime: this.getNeedTime(get(this.props, 'watchList.schedule.interval')) });
        }
    }

    getNeedTime(option) {
        return ([this.options[3].value, this.options[4].value].includes(option));
    }

    onChangeSchedule(event) {
        if (this.getNeedTime(event.target.value)) {
            this.setState({ needTime: true });
        } else if (this.state.needTime) {
            this.setState({ needTime: false });
        }

        this.props.onChange({
            target: {
                name: 'schedule',
                value: event.target.value ? {
                    interval: event.target.value,
                    time: get(this.props.watchList, 'schedule.time')
                } : null
            }
        });
    }

    onTimeChange(date) {
        this.props.onChange({
            target: {
                name: 'schedule',
                value: {
                    interval: get(this.props.watchList, 'schedule.interval'),
                    time: date.format('HH:mm')
                }
            }
        });
    }

    render() {
        const { watchList, onsaveWatchListSchedule } = this.props;
        const timeValue = get(watchList, 'schedule.time') ? moment().set({
            'hour': watchList.schedule.time.split(':')[0],
            'minute': watchList.schedule.time.split(':')[1],
        }) : moment();

        return (
            <div className='tab-pane active' id='navigations'>
                <form>
                    <div className='list-item__preview-form'>
                        <SelectInput
                            name='schedule'
                            label={gettext('Schedule type')}
                            value={get(watchList, 'schedule.interval') || ''}
                            defaultOption={''}
                            options={this.options}
                            onChange={this.onChangeSchedule} />
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
                    </div>
                    <div className='list-item__preview-footer'>
                        <input
                            type='button'
                            className='btn btn-outline-primary'
                            value={gettext('Save')}
                            onClick={onsaveWatchListSchedule}
                        />
                    </div>
                </form>
            </div>
        );
    }
}

WatchListSchedule.propTypes = {
    watchList: PropTypes.object,
    onsaveWatchListSchedule: PropTypes.func,
    onChange: PropTypes.func,
};

export default WatchListSchedule;
