import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import {getBoundingBox, getAddressLine} from '../utils';

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

export default function StaticMap({locations}) {
    const markers = locations.map((loc) => 'markers=' + encodeURIComponent(loc.location.lat + ',' + loc.location.lon));
    const params = ['size=600x400', 'key=' + window.googleMapsKey, getZoom(locations[0])];
    const src = MAPS_URL + '?' + markers.concat(params).join('&');

    return (
        <img src={src} width="640" height="640" />
    );
}

StaticMap.propTypes = {
    locations: PropTypes.arrayOf(PropTypes.object),
};