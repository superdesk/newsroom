import React from 'react';
import PropTypes from 'prop-types';
import { shortDate } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import CardRow from './CardRow';

const getMediaPanel = (item, picture, openItem, cardId) => {

    const rendition = getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-lg-3 d-flex mb-4'>
        <div className='card card--home card--gallery' onClick={() => openItem(item, cardId)}>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <div className='card-body'>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span>{shortDate(item.versioncreated)}</span>
                    </div>
                </div>
                <h4 className='card-title'>{item.headline}</h4>
            </div>
        </div>
    </div>);
};

function MediaGalleryCard ({items, title, product, openItem, isActive, cardId}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getMediaPanel(item, getPicture(item), openItem, cardId))}
        </CardRow>
    );
}

MediaGalleryCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default MediaGalleryCard;
