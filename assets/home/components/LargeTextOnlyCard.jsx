import React from 'react';
import PropTypes from 'prop-types';
import {wordCount} from 'utils';
import CardFooter from './CardFooter';
import CardBody from './CardBody';
import CardRow from './CardRow';

const getTextOnlyPanel = (item, openItem, cardId) => (
    <div key={item._id} className='col-sm-6 col-lg-4 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item, cardId)}>
            <CardBody item={item} />
            <CardFooter wordCount={wordCount(item)} pictureAvailable={false}/>
        </div>
    </div>
);

function LargeTextOnlyCard ({items, title, product, openItem, isActive, cardId}) {
    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getTextOnlyPanel(item, openItem, cardId))}
        </CardRow>
    );
}

LargeTextOnlyCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default LargeTextOnlyCard;
