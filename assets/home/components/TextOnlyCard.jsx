import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate, wordCount } from 'utils';
import MoreNewsButton from './MoreNewsButton';

const getTextOnlyPanel = (item, openItem) => (
    <div key={item._id} className='col-sm-6 col-md-4 col-lg-3 col-xxl-2 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item)}>
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
                <div className='wire-articles__item__text'>
                    <p className='card-text small'>{item.description_text}</p>
                </div>
            </div>
            <div className='card-footer'>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '}<span className='bold'>{wordCount(item)}</span> {gettext('words')}
                            {' // '}<time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

function TextOnlyCard({items, title, product, openItem}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getTextOnlyPanel(item, openItem))}
        </div>
    );
}

TextOnlyCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default TextOnlyCard;
