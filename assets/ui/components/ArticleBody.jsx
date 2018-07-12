import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleText(props) {
    return (
        <div className="wire-column__preview__content--item-detail-item-text">
            {props.children}
        </div>
    );
}

ArticleText.propTypes = {
    children: PropTypes.node,
};