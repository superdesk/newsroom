import React from 'react';
import PropTypes from 'prop-types';
import { wordCount, characterCount } from 'utils';
import CardRow from './CardRow';
import CardFooter from './CardFooter';
import {getPicture} from 'wire/utils';

const getTextOnlyPanel = (item, openItem, picture, cardId, listConfig) => (
    <div key={item._id} className='col-sm-6 col-md-4 col-lg-3 col-xxl-2 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item, cardId)}>
            <div className='card-body'>
                <h4 className='card-title'>{item.headline}</h4>
                <div className='wire-articles__item__text'>
                    <p className='card-text small'>{item.description_text}</p>
                </div>
            </div>
            <CardFooter
                wordCount={wordCount(item)}
                charCount={characterCount(item)}
                pictureAvailable={!!picture}
                source={item.source}
                versioncreated={item.versioncreated}
                listConfig={listConfig}
            />
        </div>
    </div>
);


function TextOnlyCard ({items, title, product, openItem, isActive, cardId, listConfig}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getTextOnlyPanel(item, openItem, getPicture(item), cardId, listConfig))}
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
    listConfig: PropTypes.object,
};

export default TextOnlyCard;
