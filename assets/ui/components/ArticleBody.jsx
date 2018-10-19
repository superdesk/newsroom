import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleText(props) {
    return (
        <div className={`wire-column__preview__content--item-detail-item-${props.itemType}`}>
            {props.children}
        </div>
    );
}

ArticleText.propTypes = {
    children: PropTypes.node,
    itemType: PropTypes.string,
};

ArticleText.defaultProps = {
    itemType: 'text'
};