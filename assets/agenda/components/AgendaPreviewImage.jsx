import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import {getLocations, getAddress, mapsKey} from 'maps/utils';
import StaticMap from 'maps/components/static';

/**
 * Display map image for item location
 * @param {Object} item
 * @param {function} onClick
 */
export default function AgendaPreviewImage({item, onClick}) {
    if (isEmpty(mapsKey())) {
        return null;
    }

    const locations = getLocations(item);
    const address = getAddress(item);

    if (isEmpty(locations) && isEmpty(address)) {
        return null;
    }

    return (
        <figure className="wire-column__preview__image" onClick={() => onClick(item)}>
            <StaticMap locations={locations} address={address} />
        </figure>
    );
}

AgendaPreviewImage.propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};