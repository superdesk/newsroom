import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleContentInfoWrapper(props) {
    return (
        <div className="wire-column__preview__content--item-detail-info-wrap">
            {props.children}
        </div>
    );
}

ArticleContentInfoWrapper.propTypes = {
    children: PropTypes.node
};