import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {gettext, shortDate} from 'utils';

class NotificationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {displayItems: false};

        this.root = document.getElementById('header-notification');
        this.renderNotification = this.renderNotification.bind(this);
        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    toggleDisplay() {
        if (!this.state.displayItems && (!this.props.notifications || this.props.notifications.length == 0)) return;
        this.setState({displayItems:!this.state.displayItems});
    }

    renderNotification(newItem) {
        return (<div key={newItem._id} className='card mt-3'  style={{width: '30rem', margin: '10px'}}>
            <div className="card-header">
                {newItem.headline}
                <button type="button"
                    className="close float-md-right"
                    aria-label="Close"
                    onClick={() => this.props.clearNotification(newItem._id)}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div className='card-block p-1'>
                <p>{newItem.description_text}</p>
                <footer>{gettext('Created on')} {shortDate(newItem.versioncreated)}</footer>
            </div>
        </div>);
    }

    render() {
        return this.root ? ReactDOM.createPortal(
            <span>
                <i className='icon--alert icon--white' onClick={this.toggleDisplay} >
                    {this.props.notifications && this.props.notifications.length}
                </i>
                {this.state.displayItems && this.props.notifications && this.props.notifications.length > 0 &&
                <div style={{
                    position:'absolute',
                    right: '17px',
                    top: '56px',
                    backgroundColor: 'white',
                    border: '1px solid #cecece'
                }}>
                    <div className='p-1'>
                        <span className='ml-2'>Notifications</span>
                        <button type="button"
                            className="btn btn-secondary btn-xs float-right mr-1"
                            onClick={this.props.clearAll}>Clear All
                        </button>
                    </div>
                    {this.props.notifications.map((notification) => this.renderNotification(notification))}
                </div>}
            </span>,
            this.root
        ) : null;
    }
}

NotificationList.propTypes = {
    notifications: PropTypes.array,
    clearNotification: PropTypes.func,
    clearAll: PropTypes.func,
};

export default NotificationList;