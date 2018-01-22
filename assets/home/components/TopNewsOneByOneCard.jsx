import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate, wordCount } from 'utils';
import { getPicture, getPreviewRendition, getCaption } from 'wire/utils';
import MoreNewsButton from './MoreNewsButton';
import {getProductQuery} from '../../utils';

const getTopNewsPanel = (item, picture, product) => {
    
    const rendition = getPreviewRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className='col-sm-12 col-md-6 d-flex mb-4'>
        <div className='card card--home' onClick={() => window.location.href = `/wire?q=${getProductQuery(product)}&item=${item._id}`}>
            <img className='card-img-top' src={imageUrl} alt={caption} />
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
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
                    <p className='card-text small'>{item.description_text}</p>
                </div>
            </div>
        </div>
    </div>);
};

function TopNewsOneByOneCard({items, title, product}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getTopNewsPanel(item, getPicture(item), product))}
        </div>
    );
}

TopNewsOneByOneCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default TopNewsOneByOneCard;
