import React from 'react';
import PropTypes from 'prop-types';
import { wordCount } from 'utils';
import { getPicture, getThumbnailRendition, getCaption } from 'wire/utils';
import CardBody from './CardBody';
import CardFooter from './CardFooter';
import CardRow from './CardRow';

const getPictureTextPanel = (item, picture, openItem, withPictures, cardId) => {
    const rendition = withPictures && getThumbnailRendition(picture);
    const imageUrl = rendition && rendition.href;
    const caption = rendition && getCaption(picture);

    return (<div key={item._id} className="col-sm-6 col-lg-3 d-flex mb-4">
        <div className="card card--home" onClick={() => openItem(item, cardId)}>
            {rendition &&
                <img className="card-img-top" src={imageUrl} alt={caption} />
            }
            <CardBody item={item} displayMeta={false} />
            <CardFooter
                wordCount={wordCount(item)}
                pictureAvailable={!!rendition}
                source={item.source}
                versioncreated={item.versioncreated}
            />
        </div>
    </div>);
};


function PictureTextCard ({type, items, title, product, openItem, isActive, cardId}) {
    const withPictures = type.indexOf('picture') > -1;

    return (
        <CardRow title={title} product={product} isActive={isActive}>
            {items.map((item) => getPictureTextPanel(item, getPicture(item), openItem, withPictures, cardId))}
        </CardRow>
    );
}

PictureTextCard.propTypes = {
    type: PropTypes.string,
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
    openItem: PropTypes.func,
    isActive: PropTypes.bool,
    cardId: PropTypes.string,
};

export default PictureTextCard;
