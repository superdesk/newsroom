import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleHeadline({item}) {
    return (
        item.headline && <h2 className='wire-column__preview__headline'>{item.headline}</h2> || null
    );
}

ArticleHeadline.propTypes = {
    item: PropTypes.object.isRequired,
};