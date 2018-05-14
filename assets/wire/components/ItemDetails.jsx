import React from 'react';
import PropTypes from 'prop-types';
import PreviewActionButtons from './PreviewActionButtons';
import PreviewMeta from './PreviewMeta';
import PreviewTags from './PreviewTags';
import ListItemPreviousVersions from './ListItemPreviousVersions';
import ListItemNextVersion from './ListItemNextVersion';
import { gettext, fullDate, formatHTML } from 'utils';
import { getPicture, getDetailRendition, showItemVersions, getCaption, isKilled } from 'wire/utils';

function ItemDetails({item, user, actions, onClose}) {
    const picture = getPicture(item);
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
                    {getDetailRendition(picture) && !isKilled(item) && (
                        <figure className="wire-column__preview__image">
                            <span>
                                <img src={getDetailRendition(picture).href} />
                            </span>
                            <figcaption className="wire-column__preview__caption">{getCaption(picture)}</figcaption>
                        </figure>
                    )}

                    <div className="wire-column__preview__content--item-detail-text-wrap">
                        <div className="wire-column__preview__content--item-detail-item-text">
                            <span className="wire-column__preview__slug">{item.slugline}</span>
                            <h2 className="wire-column__preview__headline">{item.headline}</h2>

                            <p className="wire-column__preview__author">
                                {item.byline && (
                                    <span>{gettext('By')}{' '}
                                        <b>{item.byline}</b>
                                    </span>
                                )}
                                {` ${gettext('at')} `}
                                {fullDate(item.versioncreated)}
                            </p>

                            {item.description_text &&
                                <p className="wire-column__preview__lead">{item.description_text}</p>}

                            {item.body_html &&
                          <div className="wire-column__preview__text"
                              dangerouslySetInnerHTML={({__html: formatHTML(item.body_html)})}/>
                            }
                        </div>

                        <PreviewMeta item={item} isItemDetail={true} />

                        <div className="wire-column__preview__content--item-detail-info-wrap">

                            <PreviewTags item={item} isItemDetail={true}/>

                            {showItemVersions(item, true) &&
                                <ListItemNextVersion item={item} />
                            }
                            {showItemVersions(item) &&
                                <ListItemPreviousVersions item={item} isPreview={true}/>
                            }
                        </div>

                    </div>

                </div>
            </article>
        </div>
    );
}

ItemDetails.propTypes = {
    item: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    onClose: PropTypes.func,
};

export default ItemDetails;
