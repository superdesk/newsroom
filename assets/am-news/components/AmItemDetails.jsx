import React from 'react';
import PropTypes from 'prop-types';
import PreviewMeta from 'wire/components/PreviewMeta';
import PreviewTags from 'wire/components/PreviewTags';
import ListItemPreviousVersions from 'wire/components/ListItemPreviousVersions';
import ListItemNextVersion from 'wire/components/ListItemNextVersion';
import PreviewActionButtons from 'components/PreviewActionButtons';
import { getPicture, getDetailRendition, showItemVersions, getCaption, isKilled, DISPLAY_ABSTRACT, isPreformatted } from 'wire/utils';
import Content from 'ui/components/Content';
import ContentHeader from 'ui/components/ContentHeader';
import ContentBar from 'ui/components/ContentBar';
import ArticleItemDetails from 'ui/components/ArticleItemDetails';
import ArticleContent from 'ui/components/ArticleContent';
import ArticlePicture from 'ui/components/ArticlePicture';
import ArticleContentWrapper from 'ui/components/ArticleContentWrapper';
import ArticleContentInfoWrapper from 'ui/components/ArticleContentInfoWrapper';
import ArticleSlugline from 'ui/components/ArticleSlugline';
import ArticleHeadline from 'ui/components/ArticleHeadline';
import ArticleAbstract from 'ui/components/ArticleAbstract';
import ArticleBodyHtml from 'ui/components/ArticleBodyHtml';
import ArticleBody from 'ui/components/ArticleBody';


const AmItemDetails = ({item, user, actions, onClose}) => {
    const picture = getPicture(item);
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
                        picture={getDetailRendition(picture)}
                        isKilled={isKilled(item)}
                        caption={getCaption(picture)}
                        isItemDetails/>}
                    <ArticleContentWrapper itemType={itemType}>
                        <ArticleBody itemType={itemType}>
                            <ArticleSlugline item={item}/>
                            <ArticleHeadline item={item}/>
                            <ArticleAbstract item={item} displayAbstract={DISPLAY_ABSTRACT}/>
                            <ArticleBodyHtml item={item}/>
                        </ArticleBody>
                        <PreviewMeta item={item} isItemDetail={true} displayUrgency={false}/>
                        <ArticleContentInfoWrapper>
                            <PreviewTags item={item} isItemDetail={true} displayGenre={false}/>
                            {showItemVersions(item, true) &&
                                <ListItemNextVersion item={item} />
                            }
                            {showItemVersions(item) &&
                                <ListItemPreviousVersions item={item} isPreview={true}/>
                            }
                        </ArticleContentInfoWrapper>
                    </ArticleContentWrapper>
                </ArticleContent>
            </ArticleItemDetails>
        </Content>
    );
};

AmItemDetails.propTypes = {
    item: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    onClose: PropTypes.func,
};

export default AmItemDetails;
