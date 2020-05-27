import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

function MoreNewsButton({title, product, photoUrl, photoUrlLabel}) {
    return ([<div key='heading' className='col-6 col-sm-8'>
        <h3 className='home-section-heading'>{title}</h3>
    </div>,
    <div key='more-news' className='col-6 col-sm-4 d-flex align-items-start justify-content-end'>
        {product &&
                <a href={`/wire?product=${product._id}`} role='button' className='btn btn-outline-primary btn-sm mb-3'>
                    {gettext('More news')}
                </a>}
        {photoUrl &&
            <a href={photoUrl} target='_blank' rel='noopener noreferrer' role='button' className='btn btn-outline-primary btn-sm mb-3'>
                {gettext(photoUrlLabel)}
            </a>}
    </div>]);
}

MoreNewsButton.propTypes = {
    title: PropTypes.string,
    product: PropTypes.object,
    photoUrl: PropTypes.string,
    photoUrlLabel: PropTypes.string,
};

export default MoreNewsButton;
