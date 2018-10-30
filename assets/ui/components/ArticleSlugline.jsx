import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleSlugline({item}) {
    return (
        item.slugline && <span className="wire-column__preview__slug">{item.slugline}</span> || null
    );
}

ArticleSlugline.propTypes = {
    item: PropTypes.object.isRequired,
};