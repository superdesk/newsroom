import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate, wordCount } from 'utils';
import MoreNewsButton from './MoreNewsButton';

const getTextOnlyPanel = item => (
    <div key={item._id} className='col-sm-6 col-md-4 col-lg-2 d-flex mb-4'>
        <div className='card card--home'>
            <div className='card-body'>
                <h5 className='card-title'>{item.headline}</h5>
                <div className='wire-articles__item__meta'>
                    <div className='wire-articles__item__meta-info'>
                        <span className='bold'>{item.slugline}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '}<span className='bold'>{wordCount(item)}</span> {gettext('words')}
                            {' // '}<time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

function TextOnlyCard({items, title, product}) {
    return (
        <div className='row'>
            <MoreNewsButton title={title} product={product}/>
            {items.map((item) => getTextOnlyPanel(item))}
        </div>
    );
}

TextOnlyCard.propTypes = {
    items: PropTypes.array,
    title: PropTypes.string,
    product: PropTypes.object,
};

export default TextOnlyCard;
