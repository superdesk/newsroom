import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


export default function ArticlePicture({isKilled, picture, caption, isItemDetails, isCustomRendition}) {
    const classes = classNames({'wire-column__preview__image--custom': isCustomRendition});
    return (
        (picture && !isKilled) && (
            <figure className='wire-column__preview__image'>
                {isItemDetails &&
                <span><img src={picture.href} className={classes} /></span> ||
                <img src={picture.href} className={classes}/>}
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
    isCustomRendition: PropTypes.bool,
};

ArticlePicture.defaultProps = {isCustomRendition: false};