import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {get} from 'lodash';
import classNames from 'classnames';

import {bem} from 'ui/utils';
import {gettext} from 'utils';

class AgendaItemTimeUpdater extends React.Component {
    constructor(props) {
        super(props);

        this.state = { timeText: '' };
        this.interval = 60; // In minutes
        this.timerIntervalId = 0;  // handle ID of our interval object

        this.updateState = this.updateState.bind(this);
    }

    componentWillMount() {
        this.activateTimer(this.props.item);
    }

    componentWillReceiveProps(nextProps) {
        if (get(this.props, 'item._created') !== get(nextProps, 'item._created') ||
            get(this.props, 'item._updated') !== get(nextProps, 'item._updated')) {
            this.activateTimer(nextProps.item);
        }
    }

    componentWillUnmount() {
        this.deactivateTimer();
    }

    activateTimer(item) {
        // Deactivate if a timer already exits
        this.deactivateTimer();

        if (!item || this.isItemPastTime(item)) {
            return;
        }

        // Set current state - no need to validate time
        this.updateState(item, false);

        // timer set for minute interval
        this.timerIntervalId = setInterval(this.updateState, 60000, item);
    }

    deactivateTimer() {
        if (this.timerIntervalId > 0) {
            clearInterval(this.timerIntervalId);
            this.setState({ timeText: '' });
        }
    }

    isItemPastTime(item) {
        // Check if the updated (and created) time is past the interval duration
        return item && (moment().diff(moment(item._created), 'minutes') >= this.interval &&
            moment().diff(moment(item._updated), 'minutes') >= this.interval);
    }

    updateState(item, checkPastTime = true) {
        if (checkPastTime && this.isItemPastTime(item)) {
            this.deactivateTimer();
            return;
        }

        const created = moment(item._created);
        const updated = moment(item._updated);
        const createdDiff = moment().diff(created, 'minutes');
        const updatedDiff = moment().diff(updated, 'minutes');

        let itemState = gettext('Posted');
        let timeDiff = createdDiff;

        if (updated.isAfter(created, 'minutes')) {
            itemState = gettext('Updated');
            timeDiff = updatedDiff;
        }

        if (timeDiff === 0) {
            this.setState({ timeText: `${itemState} ${gettext('just now')}`});
        } else {
            this.setState({ timeText: `${itemState} ${timeDiff} ${gettext('minute(s) ago')}`});
        }
    }

    render() {
        if (get(this.state.timeText, 'length', 0) <= 0) {
            return null;
        }

        const className = classNames(
            bem('wire-articles__item', 'meta-time', {'border-right': this.props.borderRight}),
            {'align-self-center': this.props.alignCenter}
        );

        return(
            <div className={className}>
                <div className="label label--yellow2">{this.state.timeText}</div>
            </div>
        );
    }
}

AgendaItemTimeUpdater.propTypes = {
    item: PropTypes.object,
    borderRight: PropTypes.bool,
    alignCenter: PropTypes.bool,
};

AgendaItemTimeUpdater.defaultProps = {
    alignCenter: false,
    borderRight: false,
};

export default AgendaItemTimeUpdater;
