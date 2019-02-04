import React from 'react';
import PropTypes from 'prop-types';
import { getMapSource } from '../utils';


export default function StaticMap({locations, scale}) {
    const src = getMapSource(locations, scale);
    return (
        <img src={src} width="640" height="640" />
    );
}

StaticMap.propTypes = {
    scale: PropTypes.number,
    locations: PropTypes.arrayOf(PropTypes.object),
};