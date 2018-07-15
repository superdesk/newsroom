import React from 'react';
import PropTypes from 'prop-types';

import {gettext} from 'utils';
import {isTouchDevice} from '../utils';
import NotificationListItem from './NotificationListItem';

class NotificationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {displayItems: false};

        this.renderNotification = this.renderNotification.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    componentDidMount() {
        if ( !isTouchDevice() ) {
            this.elem && $(this.elem).tooltip();
        }
    }

    componentWillUnmount() {
        this.elem && $(this.elem).tooltip('dispose'); // make sure it's gone
    }

    toggleDisplay() {
        if (!this.state.displayItems && (!this.props.notifications || this.props.notifications.length == 0)) return;
        this.setState({displayItems:!this.state.displayItems});
        if (!this.state.displayItems) {
            document.getElementById('header-notification').classList.add('notif--open');
        } else {
            document.getElementById('header-notification').classList.remove('notif--open');
        }
    }

    renderNotification(newItem) {
        return (<NotificationListItem key={newItem._id} item={newItem} clearNotification={this.props.clearNotification}/>);
    }

    render() {
        return (
            <div className="badge--top-right">
                {this.props.notifications && this.props.notifications.length > 0 &&
                    <div className="badge badge-pill badge-info badge-secondary">
                        {this.props.notifications && this.props.notifications.length}
                    </div>
                }

                <span
                    className="notif__circle"
                    ref={(elem) => this.elem = elem}
                    title={gettext('Notifications')}>
                    <i className='icon--alert icon--white' onClick={this.toggleDisplay} />
                </span>

                {this.state.displayItems && this.props.notifications && this.props.notifications.length > 0 &&
                    <div className="notif__list">
                        <div className='notif__list__header d-flex'>
                            <span className='notif__list__header-headline ml-3'>{gettext('Notifications')}</span>
                            <button type="button"
                                className="button-pill ml-auto mr-3"
                                onClick={this.props.clearAll}>{gettext('Clear All')}
                            </button>
                        </div>
                        {this.props.notifications.map((notification) => this.renderNotification(notification))}
                    </div>
                }
            </div>
        );
    }
}

NotificationList.propTypes = {
    notifications: PropTypes.array,
    clearNotification: PropTypes.func,
    clearAll: PropTypes.func,
};

export default NotificationList;
