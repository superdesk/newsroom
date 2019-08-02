import React from 'react';
import PropTypes from 'prop-types';
import {shouldRenderLocation, getLocations} from 'maps/utils';
import StaticMap from 'maps/components/static';
import BannerDrop from 'components/BannerDrop';
import {gettext} from '../../utils';
import {get} from 'lodash';

/**
 * Display map image for item location
 * @param {Object} item
 * @param {function} onClick
 */
export default function AgendaPreviewImage({item, onClick}) {
    if (!shouldRenderLocation(item)) {
        return null;
    }

    const locations = getLocations(item);

    return (
        <BannerDrop
            id={get(item, '_id')}
            labelCollapsed={gettext('Show Map')}
            labelOpened={gettext('Hide Map')}
            isOpen={get(item, 'coverages.length', 0) === 0} >
            <div className="wire-column__preview__image" onClick={() => onClick(item)}>
                <StaticMap locations={locations} />
            </div>
        </BannerDrop>
    );
}

AgendaPreviewImage.propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};