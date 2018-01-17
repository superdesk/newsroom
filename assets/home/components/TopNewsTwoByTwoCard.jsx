import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate, wordCount } from 'utils';
import { getPicture, getPreviewRendition, getCaption } from 'wire/utils';
import MoreNewsButton from './MoreNewsButton';

const getTopNewsLeftPanel = (item, picture) => {

    const rendition = getPreviewRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-md-9 d-flex mb-4'>
        <div className='card card--home card--horizontal'>
            {imageUrl && <div className='card-image-left'>
                <img src={imageUrl} alt={caption} />
            </div>}
            <div className='card-body'>
                <h2 className='card-title'>{item.headline}</h2>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__icons'>
                        <span className='wire-articles__item__icon'>
                            <i className='icon--text icon--gray-light'></i>
                        </span>
                        <span className='wire-articles__item__icon'>
                            <i className='icon--photo icon--gray-light'></i>
                        </span>
                        <span className='wire-articles__item__divider'>
                        </span>
                    </div>
                    <div className='wire-articles__item__meta-info'>
                        <span className='bold'>{item.slugline}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '}<span className='bold'>{wordCount(item)}</span> {gettext('words')}
                            {' // '}<time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                        </span>
                    </div>
                </div>
                <div className='wire-articles__item__text'>
                    <p className='card-text'>{item.description_text}</p>
                </div>
            </div>                        
        </div>
    </div>
    );
};
  
const getTopNewsRightPanel = (item, picture) => {

    const rendition = getPreviewRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-6 col-md-3 d-flex mb-4'>
        <div className='card card--home'>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span className='bold'>{item.slugline}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})} {'//'} {shortDate(item.versioncreated)}</span>
                    </div>
                </div>
            </div>
            <div className='card-footer'>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__icons'>
                        <span className='wire-articles__item__icon'>
                            <i className='icon--text icon--gray-light'></i>
                        </span>
                        <span className='wire-articles__item__icon'>
                            <i className='icon--photo icon--gray-light'></i>
                        </span>
                    </div>
                    <div className='wire-articles__item__meta-info'>
                        <span><span className="bold">{wordCount(item)}</span> {gettext('words')}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

const getTopNews = (items) => {
    const topNews = [];
    for(var i=0; i<items.length; i+=2) {
        topNews.push(getTopNewsLeftPanel(items[i], getPicture(items[i])));
        if (i+1 < items.length) {
            topNews.push(getTopNewsRightPanel(items[i+1], getPicture(items[i+1])));
        }
    }
    return topNews;
};

function TopNewsTwoByTwoCard({items, title, product}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {getTopNews(items)}
        </div>
    );
}

TopNewsTwoByTwoCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
};

export default TopNewsTwoByTwoCard;
