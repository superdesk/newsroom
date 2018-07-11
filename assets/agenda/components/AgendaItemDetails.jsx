import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import { formatDate, formatTime } from 'utils';
import PreviewActionButtons from 'components/PreviewActionButtons';

import { getLocations } from 'maps/utils';
import Map from 'maps/components/map';

export default function AgendaItemDetails({item, user, actions, onClose}) {
    const locations = getLocations(item);

    return (
        <div className='content--item-detail'>
            <section className='content-header'>
                <div className='content-bar navbar justify-content-between'>

                    <span className='content-bar__menu' onClick={onClose}>
                        <i className='icon--close-thin'></i>
                    </span>

                    <PreviewActionButtons item={item} user={user} actions={actions}/>
                </div>

            </section>

            <article id='preview-article' className="wire-column__preview__content--item-detal-wrap">
                <div className="wire-column__preview__content">
                    {!isEmpty(locations) && window.mapsLoaded && (
                        <figure className="wire-column__preview__image">
                            <Map locations={locations} />
                        </figure>
                    )}

                    <div className="wire-column__preview__content--item-detail-text-wrap">
                        <div className="wire-column__preview__content--item-detail-item-text">
                            <span className="wire-column__preview__slug">{item.slugline}</span>
                            <h2 className="wire-column__preview__headline">{item.name || item.headline}</h2>

                            <p className="wire-column__preview__author">
                                <span className="time-label">{formatTime(item.dates.start)}</span>
                                <div className="wire-column__preview__date">{formatDate(item.dates.start)}</div>
                            </p>

                            {item.definition_short &&
                                <p className="wire-column__preview__lead">{item.definition_short}</p>
                            }

                            {item.definition_long &&
                                <pre className="wire-column__preview__text">{item.definition_long}</pre>
                            }
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

AgendaItemDetails.propTypes = {
    item: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    onClose: PropTypes.func,
};
