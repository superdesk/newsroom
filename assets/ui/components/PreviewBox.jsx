import React from 'react';
import PropTypes from 'prop-types';

export default function PreviewBox(props) {
    return (
        <div className='wire-column__preview__coverage'>
            <div className={props.labelClass || 'wire-column__preview__coverage__headline'}>{props.label}</div>
            {props.children}
        </div>
    );
}

PreviewBox.propTypes = {
    label: PropTypes.string,
    labelClass: PropTypes.string,
    children: PropTypes.node,
};
