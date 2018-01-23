import React from 'react';
import PropTypes from 'prop-types';
import { gettext, getProductQuery } from 'utils';

function MoreNewsButton({title, product}) {
    return ([<div key='heading' className='col-6 col-sm-8'>
        <h3 className='home-section-heading'>{title}</h3>
    </div>,
    <div key='more-news' className='col-6 col-sm-4 d-flex align-items-start justify-content-end'>
        {product &&
                <a href={`/wire?q=${getProductQuery(product)}`} role='button' className='btn btn-outline-primary btn-sm mb-3'>
                    {gettext('More news')}
                </a>}
    </div>]);
}

MoreNewsButton.propTypes = {
    title: PropTypes.string,
    product: PropTypes.object,
};

export default MoreNewsButton;
