import React from 'react';
import PropTypes from 'prop-types';
import { get, isEmpty } from 'lodash';

import { gettext, isDisplayed } from 'utils';
import {
    getPicture,
    getVideos,
    getOriginalVideo,
    showItemVersions,
    isEqualItem,
    isKilled,
    DISPLAY_ABSTRACT,
    isCustomRendition,
} from 'wire/utils';

import Preview from 'ui/components/Preview';
import ArticleSlugline from 'ui/components/ArticleSlugline';
import ArticleAuthor from  'ui/components/ArticleAuthor';
import ArticlePicture from  'ui/components/ArticlePicture';
import ArticleVideo from  'ui/components/ArticleVideo';
import ArticleHeadline from 'ui/components/ArticleHeadline';
import ArticleAbstract from 'ui/components/ArticleAbstract';
import ArticleBodyHtml from 'ui/components/ArticleBodyHtml';
import ArticleEmbargoed from 'ui/components/ArticleEmbargoed';


import ListItemPreviousVersions from './ListItemPreviousVersions';
import PreviewActionButtons from 'components/PreviewActionButtons';
import PreviewTags from './PreviewTags';
import PreviewMeta from './PreviewMeta';
import AgendaLinks from './AgendaLinks';
import PreviewEdnote from './PreviewEdnote';


class WirePreview extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(nextProps) {
        if (!isEqualItem(nextProps.item, this.props.item)) {
            this.preview.scrollTop = 0; // reset scroll on change
        }
    }

    render() {
        const {item, user, actions, followStory, isFollowing, previewConfig, downloadVideo} = this.props;
        const picture = getPicture(item);
        const videos = getVideos(item);
        const isCustom = isCustomRendition(picture);

        const previousVersions = 'preview_versions';
        const canFollowStory = followStory && user && (get(item, 'slugline') || '').trim();
        return (
            <Preview onCloseClick={this.props.closePreview} published={item.versioncreated}>
                <div className='wire-column__preview__top-bar'>
                    <div>
                        {isDisplayed('follow_story', previewConfig) && canFollowStory &&
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
                <div id='preview-article' className='wire-column__preview__content' ref={(preview) => this.preview = preview}>
                    <ArticleEmbargoed item={item} />
                    {isDisplayed('slugline', previewConfig) && <ArticleSlugline item={item}/>}
                    {isDisplayed('headline', previewConfig) && <ArticleHeadline item={item}/>}
                    {(isDisplayed('byline', previewConfig) || isDisplayed('located', previewConfig)) &&
                        <ArticleAuthor item={item} displayConfig={previewConfig} />}
                    {picture && <ArticlePicture
                        picture={picture}
                        isKilled={isKilled(item)}
                        isCustomRendition={isCustom} />}

                    {isDisplayed('metadata_section', previewConfig) &&
                    <PreviewMeta item={item} isItemDetail={false} inputRef={previousVersions} displayConfig={previewConfig}/>}
                    {isDisplayed('abstract', previewConfig) &&
                    <ArticleAbstract item={item} displayAbstract={DISPLAY_ABSTRACT}/>}
                    {isDisplayed('body_html', previewConfig) && <ArticleBodyHtml item={item}/>}

                    {!isEmpty(videos) && videos.map((video) => <ArticleVideo
                        key={video.guid}
                        video={getOriginalVideo(video)}
                        isKilled={isKilled(item)}
                        headline={video.headline}
                        downloadVideo={downloadVideo}
                    />)}

                    {isDisplayed('tags_section', previewConfig) &&
                        <PreviewTags item={item} isItemDetail={false} displayConfig={previewConfig}/>}

                    {isDisplayed('ednotes_section', previewConfig) &&
                                <PreviewEdnote item={item} />}

                    {isDisplayed('item_versions', previewConfig) && showItemVersions(item) &&
                        <ListItemPreviousVersions
                            item={item}
                            isPreview={true}
                            inputId={previousVersions}
                        />
                    }
                    {isDisplayed('agenda_links', previewConfig) &&
                        <AgendaLinks item={item} preview={true} />}
                </div>
            </Preview>
        );
    }
}

WirePreview.propTypes = {
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
    previewConfig: PropTypes.object,
    downloadVideo: PropTypes.func,
};

export default WirePreview;
