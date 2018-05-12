import React from 'react';
import PropTypes from 'prop-types';

import { gettext, fullDate, formatHTML } from 'utils';
import { getPicture, getPreviewRendition, showItemVersions, getCaption, isEqualItem, isKilled } from 'wire/utils';
import ListItemPreviousVersions from './ListItemPreviousVersions';
import PreviewActionButtons from './PreviewActionButtons';
import PreviewTags from './PreviewTags';
import PreviewMeta from './PreviewMeta';


class Preview extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(nextProps) {
        if (!isEqualItem(nextProps.item, this.props.item)) {
            this.preview.scrollTop = 0; // reset scroll on change
        }
    }

    render() {
        const {item, user, actions, followStory, isFollowing} = this.props;
        const picture = getPicture(item);
        const previousVersions = 'preview_versions';
        return (
            <div className='wire-column__preview__items'>

                <div className="wire-column__preview__mobile-bar">
                    <button className="icon-button" onClick={this.props.closePreview}>
                        <i className="icon--close-large"></i>
                    </button>
                </div>

                <div className='wire-column__preview__top-bar'>
                    <div>
                        {user && item.slugline && item.slugline.trim() &&
                            <button type="button"
                                disabled={isFollowing}
                                className="btn btn-outline-primary btn-responsive"
                                onClick={() => followStory(item)}>
                                {gettext('Follow story')}
                            </button>
                        }
                    </div>

                    <PreviewActionButtons item={item} user={user} actions={actions} />
                </div>

                <div className='wire-column__preview__date'>{gettext('Published')}{' '}{fullDate(item.versioncreated)}</div>

                <div id='preview-article' className='wire-column__preview__content' ref={(preview) => this.preview = preview}>
                    {item.slugline &&
                        <span className='wire-column__preview__slug'>{item.slugline}</span>
                    }
                    <h2 className='wire-column__preview__headline'>{item.headline}</h2>
                    {(item.byline || item.located) && (
                        <p className='wire-column__preview__author'>
                            {item.byline && (
                                <span>{gettext('By')}{' '}
                                    <b>{item.byline}</b>{' '}
                                </span>
                            )}
                            {item.located && (
                                <span>{gettext('in {{ located}}', {located: item.located})}</span>
                            )}
                        </p>
                    )}
                    {getPreviewRendition(picture) && !isKilled(item) && (
                        <figure className='wire-column__preview__image'>
                            <img src={getPreviewRendition(picture).href} />
                            <figcaption className='wire-column__preview__caption'>{getCaption(picture)}</figcaption>
                        </figure>
                    )}

                    <PreviewMeta item={item} isItemDetail={false} inputRef={previousVersions}/>
                    {item.description_text &&
                            <p className='wire-column__preview__lead'>{item.description_text}</p>
                    }
                    {item.body_html &&
                            <div className='wire-column__preview__text' id='preview-body' dangerouslySetInnerHTML={({__html: formatHTML(item.body_html)})} />
                    }

                    <PreviewTags item={item} isItemDetail={false} />

                    {showItemVersions(item) &&
                        <ListItemPreviousVersions
                            item={item}
                            isPreview={true}
                            inputId={previousVersions}
                        />
                    }

                </div>
            </div>
        );
    }
}

Preview.propTypes = {
    user: PropTypes.string,
    item: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    followStory: PropTypes.func,
    isFollowing: PropTypes.bool,
    closePreview: PropTypes.func,
};

export default Preview;
