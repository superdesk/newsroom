import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const getCarouselItem = (photoItem, index) => (
    <div key={photoItem.Id}
        className={classNames('carousel-item', {'active': index === 0})}
        onClick={()=>{window.open(`https://photos.aap.com.au/${photoItem.Link}`,'_blank');}}
        style={{
            backgroundImage: `url('${photoItem.CoverPictureLink}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer'}}>
        <div className='carousel-caption'>
            <h3>{photoItem.Heading}</h3>
        </div>
        <div className='carousel-overlay'></div>
    </div>
);

class PhotoCarousel extends React.Component {
    render() {
        return (<div className='row'>
            <div className='col-12'>
                <div id='carousel' className='carousel slide' data-ride='carousel'>
                    <div className='carousel-inner'>
                        {this.props.photos.map((photoItem, index) => getCarouselItem(photoItem, index))}
                    </div>
                    <a className='carousel-control-prev' href='#carousel' role='button' data-slide='prev'>
                        <span className='carousel-control-prev-icon' aria-hidden='true'></span>
                        <span className='sr-only'>Previous</span>
                    </a>
                    <a className='carousel-control-next' href='#carousel' role='button' data-slide='next'>
                        <span className='carousel-control-next-icon' aria-hidden='true'></span>
                        <span className='sr-only'>Next</span>
                    </a>
                </div>
            </div>
        </div>);
    }

}

PhotoCarousel.propTypes = {
    photos: PropTypes.array,
};

export default PhotoCarousel;