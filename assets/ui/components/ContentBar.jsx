import React from 'react';
import PropTypes from 'prop-types';

export default function ContentBar(props) {
    return (
        <div className='content-bar navbar justify-content-between'>
            <span className='content-bar__menu' onClick={props.onClose}>
                {props.onClose &&
                    <i className='icon--close-thin'></i>
                }
            </span>
            {props.children}
        </div>
    );
}

ContentBar.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
};