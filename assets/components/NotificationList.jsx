import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class NotificationList extends React.Component {
    constructor(props) {
        super(props);
        this.root = document.getElementById('header-notification');
    }

    render() {
        return this.root ? ReactDOM.createPortal(
            <span>
                <i className='icon--alert icon--white' >
                    {this.props.newItems && this.props.newItems.length}
                </i>
            </span>,
            this.root
        ) : null;
    }
}

NotificationList.propTypes = {
    newItems: PropTypes.array,
};

export default NotificationList;