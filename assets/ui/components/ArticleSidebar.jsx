import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleSidebar(props) {
    return (
        <div className="wire-column__preview__content--event-detail-info-wrap">
            <div className="wire-column__preview__tags mt-3">
                {props.children}
            </div>
        </div>
    );
}

ArticleSidebar.propTypes = {
    children: PropTypes.node,
};