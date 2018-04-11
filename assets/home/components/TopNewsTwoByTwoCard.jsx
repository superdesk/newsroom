import React from 'react';
import PropTypes from 'prop-types';
import { wordCount } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import CardRow from './CardRow';
import CardFooter from './CardFooter';
import CardMeta from './CardMeta';
import CardBody from './CardBody';

const getTopNewsLeftPanel = (item, picture, openItem, cardId) => {

    const rendition = getThumbnailRendition(picture, true);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-md-9 d-flex mb-4'>
        <div className='card card--home card--horizontal' onClick={() => openItem(item, cardId)}>
            {imageUrl && <div className='card-image-left'>
                <img src={imageUrl} alt={caption} />
            </div>}
            <div className='card-body'>
                <h2 className='card-title'>{item.headline}</h2>
                <CardMeta
                    pictureAvailable={!!picture}
                    wordCount={wordCount(item)}
                    source={item.source}
                    versioncreated={item.versioncreated}
                    displayDivider={false}
                    slugline={item.slugline}
                />
                <div className='wire-articles__item__text'>
                    <p className='card-text'>{item.description_text}</p>
                </div>
            </div>
        </div>
    </div>
    );
};

const getTopNewsRightPanel = (item, picture, openItem, cardId) => {

    const rendition = getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-md-3 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item, cardId)}>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <CardBody item={item} displayDescription={false} displaySource={false}/>
            <CardFooter
                wordCount={wordCount(item)}
                pictureAvailable={!!picture}
                source={item.source}
                versioncreated={item.versioncreated}
            />
        </div>
    </div>);
};

const getTopNews = (items, openItem, cardId) => {
    const topNews = [];
    for(var i=0; i<items.length; i+=2) {
        topNews.push(getTopNewsLeftPanel(items[i], getPicture(items[i]), openItem, cardId));
        if (i+1 < items.length) {
            topNews.push(getTopNewsRightPanel(items[i+1], getPicture(items[i+1]), openItem, cardId));
        }
    }
    return topNews;
};

function TopNewsTwoByTwoCard ({items, title, product, openItem, isActive, cardId}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {getTopNews(items, openItem, cardId)}
        </CardRow>
    );
}

TopNewsTwoByTwoCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default TopNewsTwoByTwoCard;
