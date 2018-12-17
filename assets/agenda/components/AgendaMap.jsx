import React from 'react';
import PropTypes from 'prop-types';


export default function AgendaMap({image}) {
    return (
        image && <figure className="wire-column__preview__image">
            <span>
                {image}
            </span>            
        </figure>
    );
}

AgendaMap.propTypes = {
    image: PropTypes.element,
};