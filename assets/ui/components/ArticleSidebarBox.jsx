import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleSidebarBox(props) {
    return (
        <div>
            <span className="column__preview__tags__box-headline">
                {props.label}
            </span>
            <div className="column__preview__tags__column pt-4 pb-2">
                {props.children}
            </div>
        </div>
    );
}

ArticleSidebarBox.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
};
