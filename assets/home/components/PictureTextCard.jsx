import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, wordCount, fullDate } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import MoreNewsButton from './MoreNewsButton';

const getPictureTextPanel = (item, picture, openItem) => {
    const rendition = getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className="col-sm-6 col-lg-3 d-flex mb-4">
        <div className="card card--home" onClick={() => openItem(item)}>
            <img className="card-img-top" src={imageUrl} alt={caption} />
            <div className="card-body">
                <h4 className="card-title">{item.headline}</h4>
                <div className='wire-articles__item__text'>
                    <p className='card-text small'>{item.description_text}</p>
                </div>
            </div>
            <div className="card-footer">
                <div className="wire-articles__item__meta">
                    <div className="wire-articles__item__icons">
                        <span className="wire-articles__item__icon">
                            <i className="icon--text icon--gray-light"></i>
                        </span>
                        <span className="wire-articles__item__icon">
                            <i className="icon--photo icon--gray-light"></i>
                        </span>
                    </div>
                    <div className="wire-articles__item__meta-info">
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '}<span className='bold'>{wordCount(item)}</span> {gettext('words')}
                            {' // '}<time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

function PictureTextCard({items, title, product, openItem}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getPictureTextPanel(item, getPicture(item), openItem))}
        </div>
    );
}

PictureTextCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default PictureTextCard;
