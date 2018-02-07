import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, wordCount } from 'utils';
import MoreNewsButton from './MoreNewsButton';

const getTextOnlyPanel = (item, openItem) => (
    <div key={item._id} className='col-sm-6 col-lg-4 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item)}>
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
                <div className='wire-articles__item__text'>
                    <p>{item.description_text}</p>
                </div>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span className='bold'>{item.slugline}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '} {shortDate(item.versioncreated)}
                        </span>
                    </div>
                </div>
            </div>
            <div className='card-footer'>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__icons'>
                        <span className='wire-articles__item__icon'>
                            <i className='icon--text icon--gray-light'></i>
                        </span>
                    </div>
                    <div className='wire-articles__item__meta-info'>
                        <span><span className='bold'>{wordCount(item)}</span> {gettext('words')}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

function LargeTextOnlyCard({items, title, product, openItem}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getTextOnlyPanel(item, openItem))}
        </div>
    );
}

LargeTextOnlyCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default LargeTextOnlyCard;
