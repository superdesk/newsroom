import React from 'react';
import PropTypes from 'prop-types';
import { wordCount } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import CardBody from './CardBody';
import CardFooter from './CardFooter';
import MoreNewsButton from './MoreNewsButton';

const getPictureTextPanel = (item, picture, openItem, withPictures) => {
    const rendition = withPictures && getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className="col-sm-6 col-lg-3 d-flex mb-4">
        <div className="card card--home" onClick={() => openItem(item)}>
            {rendition &&
                <img className="card-img-top" src={imageUrl} alt={caption} />
            }
            <CardBody item={item} meta={false} />
            <CardFooter
                wordCount={wordCount(item)}
                pictureAvailable={!!rendition}
                source={item.source}
                versioncreated={item.versioncreated}
            />
        </div>
    </div>);
};

function PictureTextCard({items, title, product, openItem, type}) {
    const withPictures = type.indexOf('picture') > -1;
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getPictureTextPanel(item, getPicture(item), openItem, withPictures))}
        </div>
    );
}

PictureTextCard.propTypes = {
    type: PropTypes.string,
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
};

export default PictureTextCard;
