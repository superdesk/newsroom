import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class CalendarButtonWrapper extends React.Component {
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

CalendarButtonWrapper.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    active: PropTypes.bool,
};

export default CalendarButtonWrapper;
