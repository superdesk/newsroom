import React from 'react';
import PropTypes from 'prop-types';
import { wordCount } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import CardRow from './CardRow';
import CardMeta from './CardMeta';

const getTopNewsPanel = (item, picture, openItem, cardId) => {
    
    const rendition = getThumbnailRendition(picture, true);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-12 col-md-6 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item, cardId)}>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
                <CardMeta
                    pictureAvailable={!!picture}
                    wordCount={wordCount(item)}
                    source={item.source}
                    versioncreated={item.versioncreated}
                    displayDivider={false}
                />
                <div className='wire-articles__item__text'>
                    <p className='card-text small'>{item.description_text}</p>
                </div>
            </div>
        </div>
    </div>);
};

function TopNewsOneByOneCard ({items, title, product, openItem, isActive, cardId}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getTopNewsPanel(item, getPicture(item), openItem, cardId))}
        </CardRow>
    );
}

TopNewsOneByOneCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default TopNewsOneByOneCard;
