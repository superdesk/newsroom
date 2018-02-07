import React from 'react';
import PropTypes from 'prop-types';
import {wordCount} from 'utils';
import {getCaption, getPicture, getThumbnailRendition} from 'wire/utils';
import MoreNewsButton from './MoreNewsButton';
import CardFooter from './CardFooter';
import CardBody from './CardBody';

const getPictureTextPanel = (item, picture, openItem) => {
    const rendition = getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className="col-sm-6 col-lg-4 d-flex mb-4">
        <div className="card card--home" onClick={() => openItem(item)}>
            <img className="card-img-top" src={imageUrl} alt={caption} />
            <CardBody item={item}/>
            <CardFooter wordCount={wordCount(item)} pictureAvailable={true}/>
        </div>
    </div>);
};

function LargePictureTextCard({items, title, product, openItem}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getPictureTextPanel(item, getPicture(item), openItem))}
        </div>
    );
}

LargePictureTextCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default LargePictureTextCard;
