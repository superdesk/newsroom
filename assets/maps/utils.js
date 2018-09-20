import {get} from 'lodash';

/**
 * Get item locations
 * @param {Object} item
 */
export function getLocations(item) {
    return (get(item, 'location')) || [];
}

/**
 * Get locations with geo coordinates
 * @param {Object} item 
 * @return {Array}
 */
export function getGeoLocations(locations) {
    return locations.filter((loc) => get(loc, 'location.lat'));
}

/**
 * Get location address for item
 *
 * @param {Object} item 
 * @return {Object}
 */
export function getAddress(item) {
    return get(item, 'location.0.address');
}

/**
 * Get location bounding box
 * @param {Object} location 
 * @return {Array}
 */
export function getBoundingBox(location) {
    return get(location, 'address.boundingbox');
}

/**
 * Get location address line
 * @param {Object} location 
 * @return {String}
 */
export function getAddressLine(location) {
    return get(location, 'address.line.0');
}

/**
 * Get address state
 *
 * @param {Object} location
 */
export function getAddressState(location) {
    return get(location, 'address.locality');
}

/**
 * Get address country
 *
 * @param {Object} location
 */
export function getAddressCountry(location) {
    return get(location, 'address.country');
}

/**
 * Get bounds for location
 * @param {Object} location 
 * @return {LatLngBoundsLiteral}
 */
export function getBounds(location) {
    const bbox = getBoundingBox(location);

    if (bbox) {
        return {
            south: parseFloat(bbox[0]),
            north: parseFloat(bbox[1]),
            west: parseFloat(bbox[2]),
            east: parseFloat(bbox[3]),
        };
    }
}

/**
 * Get position for location
 * @param {Object} location 
 * @return {LatLngLiteral}
 */
export function getLatLng(location) {
    return {
        lat: get(location, 'location.lat'),
        lng: get(location, 'location.lon'),
    };
}

export function mapsLoaded() {
    return window.mapsLoaded;
}

export function mapsKey() {
    return window.googleMapsKey;
}
