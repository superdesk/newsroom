import React from 'react';
import PropTypes from 'prop-types';
import MoreNewsButton from './MoreNewsButton';

const getMediaPanel = (photo, index) => {
    return (<div key={index} className='col-sm-6 col-lg-3 d-flex mb-4'>
        <div className='card card--home card--gallery'
            onClick={()=>{window.open(photo.href,'_blank');}}>
            <img className='card-img-top' src={photo.media_url} alt={photo.description} />
            <div className='card-body'>
                <h4 className='card-title'>{photo.description}</h4>
            </div>
        </div>
    </div>);
};

function PhotoGalleryCard({photos, title, moreUrl, moreUrlLabel}) {
    return (
        <div className='row'>
            <MoreNewsButton key="more" title={title} photoUrl={moreUrl} photoUrlLabel={moreUrlLabel} />
            {photos.map((photo, index) => getMediaPanel(photo, index))}
        </div>
    );
}

PhotoGalleryCard.propTypes = {
    photos: PropTypes.array,
    title: PropTypes.string,
    moreUrl: PropTypes.string,
    moreUrlLabel: PropTypes.string,
};

export default PhotoGalleryCard;
