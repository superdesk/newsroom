import React from 'react';
import PropTypes from 'prop-types';

export default function Preview(props) {
    return (
        <div className='wire-column__preview__items'>
            <div className="wire-column__preview__mobile-bar">
                <button className="icon-button" onClick={props.onCloseClick}>
                    <i className="icon--close-large"></i>
                </button>
            </div>
            {props.children}
        </div>
    );
}

Preview.propTypes = {
    children: PropTypes.node,
    onCloseClick: PropTypes.func,
};