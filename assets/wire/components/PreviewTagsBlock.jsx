import React from 'react';
import PropTypes from 'prop-types';

export default function PreviewTagsBlock(props) {
    return (
        <div className='column__preview__tags__column'>
            <span className='wire-column__preview__tags__headline'>
                {props.label}</span>
            {props.children}
        </div>
    );
}

PreviewTagsBlock.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
};