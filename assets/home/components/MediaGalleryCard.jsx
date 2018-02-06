import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import MoreNewsButton from './MoreNewsButton';

const getMediaPanel = (item, picture, openItem) => {

    const rendition = getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-lg-3 d-flex mb-4'>
        <div className='card card--home card--gallery' onClick={() => openItem(item)}>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <div className='card-body'>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span>{gettext('Source: {{ source }}', {source: item.source})} {'//'} {shortDate(item.versioncreated)}</span>
                    </div>
                </div>
                <h4 className='card-title'>{item.headline}</h4>
            </div>
        </div>
    </div>);
};

function MediaGalleryCard({items, title, product, openItem}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getMediaPanel(item, getPicture(item), openItem))}
        </div>
    );
}

MediaGalleryCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default MediaGalleryCard;
