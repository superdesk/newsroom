import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate, wordCount } from 'utils';
import CardRow from './CardRow';

const getTextOnlyPanel = (item, openItem, cardId) => (
    <div key={item._id} className='col-sm-6 col-md-4 col-lg-2 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item, cardId)}>
            <div className='card-body card-body--one-column'>
                <h5 className='card-title'>{item.headline}</h5>
                <div className='wire-articles__item__text'>
                    <p className='card-text tiny'>{item.description_text}</p>
                </div>
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


function TextOnlyCard ({items, title, product, openItem, isActive, cardId}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getTextOnlyPanel(item, openItem, cardId))}
        </CardRow>
    );
}

TextOnlyCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default TextOnlyCard;
