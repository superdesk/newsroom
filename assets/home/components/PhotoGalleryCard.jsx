import React from 'react';
import PropTypes from 'prop-types';
import MoreNewsButton from './MoreNewsButton';

const getMediaPanel = (photo) => {
    return (<div key={photo.Id} className='col-sm-6 col-lg-3 d-flex mb-4'>
        <div className='card card--home card--gallery'
            onClick={()=>{window.open(`https://photos.aap.com.au/${photo.Link}`,'_blank');}}>
            <img className='card-img-top' src={photo.CoverPictureLink} alt={photo.Heading} />
            <div className='card-body'>
                <h4 className='card-title'>{photo.Heading}</h4>
            </div>
        </div>
    </div>);
};

function PhotoGalleryCard({photos, title}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} photoUrl={'https://photos.aap.com.au/'} />
            {photos.map((photo) => getMediaPanel(photo))}
        </div>
    );
}

PhotoGalleryCard.propTypes = {
    photos: PropTypes.array,
    title: PropTypes.string,
};

export default PhotoGalleryCard;
