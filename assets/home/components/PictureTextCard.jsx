import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, wordCount, getProductQuery } from 'utils';
import { getPicture, getPreviewRendition, getCaption } from 'wire/utils';

const getPictureTextPanel = (item, picture) => {
    const rendition = getPreviewRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className="col-sm-6 col-lg-3 d-flex mb-4">
        <div className="card card--home">
            <img className="card-img-top" src={imageUrl} alt={caption} />
            <div className="card-body">
                <h4 className="card-title">{item.headline}</h4>
                <div className="wire-articles__item__meta">
                    <div className="wire-articles__item__meta-info">
                        <span className="bold">{item.slugline}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})} {'//'} {shortDate(item.versioncreated)}</span>
                    </div>
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
                        <span><span className="bold">{wordCount(item)}</span> {gettext('words')}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

function PictureTextCard({items, title, product}) {
    return (
        <div className='row'>
            <div className='col-6 col-sm-8'>
                <h3 className='home-section-heading'>{title}</h3>
            </div>
            <div className='col-6 col-sm-4 d-flex align-items-start justify-content-end'>
                {product &&
                <button onClick={() => window.location.href = `/wire?q=${getProductQuery(product)}`} type='button' className='btn btn-outline-primary btn-sm mb-3'>{gettext('More news')}</button>}
            </div>
            {items.map((item) => getPictureTextPanel(item, getPicture(item)))}
        </div>
    );
}

PictureTextCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
};

export default PictureTextCard;
