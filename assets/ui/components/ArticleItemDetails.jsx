import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleItemDetails(props) {
    return (
        <article id='preview-article' className="wire-column__preview__content--item-detail-wrap">
            {props.children}
        </article>
    );
}

ArticleItemDetails.propTypes = {
    children: PropTypes.node
};