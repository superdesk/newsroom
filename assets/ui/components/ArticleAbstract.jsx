import React from 'react';
import PropTypes from 'prop-types';

export default function ArticleAbstract({item, displayAbstract}) {
    return (
        (item.description_text && displayAbstract) &&
            <p className='wire-column__preview__lead'>{item.description_text}</p> || null
    );
}

ArticleAbstract.propTypes = {
    item: PropTypes.object.isRequired,
    displayAbstract: PropTypes.bool,
};