import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import PreviewMeta from './PreviewMeta';
import PreviewTags from './PreviewTags';
import AgendaLinks from './AgendaLinks';
import { isDisplayed, fullDate, gettext } from 'utils';
import ListItemPreviousVersions from './ListItemPreviousVersions';
import ListItemNextVersion from './ListItemNextVersion';
import PreviewActionButtons from 'components/PreviewActionButtons';
import {
    getPicture,
    getVideos,
    getOriginalVideo,
    showItemVersions,
    isKilled,
    DISPLAY_ABSTRACT,
    isPreformatted,
    isCustomRendition,
} from 'wire/utils';
import Content from 'ui/components/Content';
import ContentHeader from 'ui/components/ContentHeader';
import ContentBar from 'ui/components/ContentBar';
import ArticleItemDetails from 'ui/components/ArticleItemDetails';
import ArticleContent from 'ui/components/ArticleContent';
import ArticlePicture from 'ui/components/ArticlePicture';
import ArticleVideo from  'ui/components/ArticleVideo';
import ArticleContentWrapper from 'ui/components/ArticleContentWrapper';
import ArticleContentInfoWrapper from 'ui/components/ArticleContentInfoWrapper';
import ArticleHeadline from 'ui/components/ArticleHeadline';
import ArticleAbstract from 'ui/components/ArticleAbstract';
import ArticleBodyHtml from 'ui/components/ArticleBodyHtml';
import ArticleBody from 'ui/components/ArticleBody';
import ArticleAuthor from 'ui/components/ArticleAuthor';
import ArticleEmbargoed from 'ui/components/ArticleEmbargoed';
import PreviewEdnote from './PreviewEdnote';


function ItemDetails({item, user, actions, onClose, detailsConfig, downloadVideo}) {
    const picture = getPicture(item);
    const videos = getVideos(item);
    const isCustom = isCustomRendition(picture);

    const itemType = isPreformatted(item) ? 'preformatted' : 'text';
    return (
        <Content type="item-detail">
            <ContentHeader>
                <ContentBar onClose={onClose}>
                    <PreviewActionButtons item={item} user={user} actions={actions}/>
                </ContentBar>
            </ContentHeader>
            <ArticleItemDetails>
                <ArticleContent>
                    {picture && <ArticlePicture
                        picture={picture}
                        isKilled={isKilled(item)}
                        isCustomRendition={isCustom}
                        isItemDetails />}
                    <ArticleContentWrapper itemType={itemType}>
                        <ArticleBody itemType={itemType}>
                            <ArticleEmbargoed item={item} />
                            <div className='wire-column__preview__date pb-2'>
                                {gettext('Published')}{' '}{fullDate(item.versioncreated)}
                            </div>
                            {isDisplayed('headline', detailsConfig) && <ArticleHeadline item={item}/>}
                            <ArticleAuthor item={item} displayConfig={detailsConfig} />
                            {isDisplayed('abstract', detailsConfig) &&
                            <ArticleAbstract item={item} displayAbstract={DISPLAY_ABSTRACT}/>}
                            {isDisplayed('body_html', detailsConfig) && <ArticleBodyHtml item={item}/>}
                            {!isEmpty(videos) && videos.map((video) => <ArticleVideo
                                key={video.guid}
                                video={getOriginalVideo(video)}
                                isKilled={isKilled(item)}
                                headline={video.headline}
                                downloadVideo={downloadVideo}
                            />)}
                        </ArticleBody>



                        {isDisplayed('metadata_section', detailsConfig) &&
                            <PreviewMeta item={item} isItemDetail={true} displayConfig={detailsConfig}/>}
                        <ArticleContentInfoWrapper>
                            {isDisplayed('tags_section', detailsConfig) &&
                                <PreviewTags item={item} isItemDetail={true} displayConfig={detailsConfig}/>}

                            {isDisplayed('ednotes_section', detailsConfig) &&
                                <PreviewEdnote item={item} />}

                            {isDisplayed('item_versions', detailsConfig) && showItemVersions(item, true) &&
                                <ListItemNextVersion item={item} displayConfig={detailsConfig}  />
                            }
                            {isDisplayed('item_versions', detailsConfig) && showItemVersions(item) &&
                                <ListItemPreviousVersions item={item} isPreview={true}/>
                            }

                            {isDisplayed('agenda_links', detailsConfig) && <AgendaLinks item={item} />}
                        </ArticleContentInfoWrapper>
                    </ArticleContentWrapper>
                </ArticleContent>
            </ArticleItemDetails>
        </Content>
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
    detailsConfig: PropTypes.object,
    downloadVideo: PropTypes.func,
};

export default ItemDetails;

