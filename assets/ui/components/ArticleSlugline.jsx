import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleSlugline({item}) {
    return (
        <span className="wire-column__preview__slug">{item.slugline}</span>
    );
}

ArticleSlugline.propTypes = {
    item: PropTypes.object.isRequired,
};