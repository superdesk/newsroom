import React from 'react';
import PropTypes from 'prop-types';

export default function Content(props) {
    return (
        <div className={'content--' + props.type}>
            {props.children}
        </div>
    );
}

Content.propTypes = {
    type: PropTypes.string,
    children: PropTypes.node,
};