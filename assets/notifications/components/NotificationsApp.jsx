import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    deleteNotification,
    deleteAllNotifications
} from '../actions';

import NotificationList from 'components/NotificationList';

class NotificationsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return [
            <NotificationList key="notifications"
                notifications={this.props.notifications}
                clearNotification={this.props.clearNotification}
                clearAll={this.props.clearAll}
            />,
        ];
    }
}

NotificationsApp.propTypes = {
    user: PropTypes.string,
    notifications: PropTypes.arrayOf(PropTypes.object),
    clearNotification: PropTypes.func,
    clearAll: PropTypes.func,
};

const mapStateToProps = (state) => ({
    user: state.user,
    notifications: state.notifications,
});

const mapDispatchToProps = (dispatch) => ({
    clearNotification: (id) => dispatch(deleteNotification(id)),
    clearAll: () => dispatch(deleteAllNotifications()),
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsApp);
