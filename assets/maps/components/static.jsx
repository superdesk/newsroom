import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import {
    getGeoLocations,
    getBoundingBox,
    getAddressLine,
    getAddressState,
    getAddressCountry,
    mapsKey,
} from '../utils';

const MAPS_URL = 'https://maps.googleapis.com/maps/api/staticmap';

/**
 * Get zoom param based on location
 * @param {Object} location 
 */
function getZoom(location) {
    const box = getBoundingBox(location);
    const line = getAddressLine(location);

    if (box) { // use bounding box if provided
        return [
            {lat: box[0], lon: box[2]},
            {lat: box[1], lon: box[3]},
        ].map((point) => 'visible=' + encodeURIComponent(point.lat + ',' + point.lon)).join('&');
    }

    // fallback to zoom, use 15 if we are on street level, 8 otherwise
    return !isEmpty(line) ? 'zoom=15' : 'zoom=8';
}

function getLocationDetails(location) {
    return [location.name,
        getAddressLine(location),
        getAddressState(location),
        getAddressCountry(location),
    ].filter((x) => !!x).join(', ');
}

export default function StaticMap({locations, scale}) {
    const params = ['size=600x400', 'key=' + mapsKey(), 'scale=' + (scale || 1)];
    const geoLocations = getGeoLocations(locations);
    let src;

    if (!isEmpty(geoLocations)) {
        const markers = geoLocations.map((loc) => 'markers=' + encodeURIComponent(loc.location.lat + ',' + loc.location.lon));
        params.push(getZoom(geoLocations[0]));
        src = MAPS_URL + '?' + markers.concat(params).join('&');
    } else {
        const location = locations[0];
        params.push('center=' + encodeURIComponent(getLocationDetails(location)));
        params.push('markers=' + encodeURIComponent(getLocationDetails(location)));
        src = MAPS_URL + '?' + params.join('&');
    }

    return (
        <img src={src} width="640" height="640" />
    );
}

StaticMap.propTypes = {
    scale: PropTypes.number,
    locations: PropTypes.arrayOf(PropTypes.object),
};