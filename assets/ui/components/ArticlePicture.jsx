import React from 'react';
import PropTypes from 'prop-types';

export default function ArticlePicture({isKilled, picture, caption, isItemDetails}) {
    return (
        (picture && !isKilled) && (
            <figure className='wire-column__preview__image'>
                {isItemDetails && <span><img src={picture.href} /></span> || <img src={picture.href} />}
                <figcaption className='wire-column__preview__caption'>{caption}</figcaption>
            </figure>
        ) || null
    );
}

ArticlePicture.propTypes = {
    isKilled: PropTypes.bool.isRequired,
    picture: PropTypes.object.isRequired,
    caption: PropTypes.string.isRequired,
    isItemDetails: PropTypes.bool,
};