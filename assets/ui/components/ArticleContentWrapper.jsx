import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleContentWrapper(props) {
    const itemWrapperClassName = `wire-column__preview__content--item-detail-${props.itemType}-wrap`;
    return (
        <div className={itemWrapperClassName}>
            {props.children}
        </div>
    );
}

ArticleContentWrapper.propTypes = {
    children: PropTypes.node,
    itemType: PropTypes.string
};