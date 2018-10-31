import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleContent(props) {
    return (
        <div className="wire-column__preview__content">
            {props.children}
        </div>
    );
}

ArticleContent.propTypes = {
    children: PropTypes.node
};