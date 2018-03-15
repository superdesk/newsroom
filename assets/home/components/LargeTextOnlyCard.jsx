import React from 'react';
import PropTypes from 'prop-types';
import {wordCount} from 'utils';
import MoreNewsButton from './MoreNewsButton';
import CardFooter from './CardFooter';
import CardBody from './CardBody';

const getTextOnlyPanel = (item, openItem) => (
    <div key={item._id} className='col-sm-6 col-lg-4 d-flex mb-4'>
        <div className='card card--home' onClick={() => openItem(item)}>
            <CardBody item={item} />
            <CardFooter wordCount={wordCount(item)} pictureAvailable={false}/>
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
