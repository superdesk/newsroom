import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, getProductQuery } from 'utils';
import { getPicture, getPreviewRendition, getCaption } from 'wire/utils';

const getMediaPanel = (item, picture) => {
    
    const rendition = getPreviewRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-lg-3 d-flex mb-4'>
        <div className='card card--home card--gallery'>
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

function MediaGalleryCard({items, title, product}) {
    return (
        <div className='row'>
            <div className='col-6 col-sm-8'>
                <h3 className='home-section-heading'>{title}</h3>
            </div>
            <div className='col-6 col-sm-4 d-flex align-items-start justify-content-end'>
                {product &&
                <button onClick={() => window.location.href = `/wire?q=${getProductQuery(product)}`} type='button' className='btn btn-outline-primary btn-sm mb-3'>{gettext('More news')}</button>}
            </div>
            {items.map((item) => getMediaPanel(item, getPicture(item)))}
        </div>
    );
}

MediaGalleryCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
};

export default MediaGalleryCard;
