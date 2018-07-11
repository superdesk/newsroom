import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import {getLocations} from 'maps/utils';
import StaticMap from 'maps/components/static';

/**
 * Display map image for item location
 * @param {Object} item
 * @param {function} onClick
 */
export default function AgendaPreviewImage({item, onClick}) {
    const locations = getLocations(item);

    if (isEmpty(locations) || isEmpty(window.googleMapsKey)) {
        return null;
    }

    return (
        <figure className="wire-column__preview__image" onClick={() => onClick(item)}>
            <StaticMap locations={locations} />
        </figure>
    );
}

AgendaPreviewImage.propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};