import React from 'react';
import PropTypes from 'prop-types';

import {
    getPicture,
    getPreviewRendition,
    getCaption,
    showItemVersions,
    isEqualItem, isKilled, DISPLAY_ABSTRACT } from 'wire/utils';

import Preview from 'ui/components/Preview';
import ArticleSlugline from 'ui/components/ArticleSlugline';
import ArticleAuthor from  'ui/components/ArticleAuthor';
import ArticlePicture from  'ui/components/ArticlePicture';
import ArticleHeadline from 'ui/components/ArticleHeadline';
import ArticleAbstract from 'ui/components/ArticleAbstract';
import ArticleBodyHtml from 'ui/components/ArticleBodyHtml';

import PreviewActionButtons from 'components/PreviewActionButtons';
import PreviewTags from 'wire/components/PreviewTags';
import PreviewMeta from 'wire/components/PreviewMeta';
import ListItemPreviousVersions from 'wire/components/ListItemPreviousVersions';



class AmPreview extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(nextProps) {
        if (!isEqualItem(nextProps.item, this.props.item)) {
            this.preview.scrollTop = 0; // reset scroll on change
        }
    }

    render() {
        const {item, user, actions} = this.props;
        const picture = getPicture(item);
        const previousVersions = 'preview_versions';
        return (
            <Preview onCloseClick={this.props.closePreview} published={item.versioncreated}>
                <div className='wire-column__preview__top-bar'>
                    <PreviewActionButtons item={item} user={user} actions={actions} />
                </div>
                <div id='preview-article' className='wire-column__preview__content' ref={(preview) => this.preview = preview}>
                    <ArticleSlugline item={item}/>
                    <ArticleHeadline item={item}/>
                    <ArticleAuthor item={item} />
                    {picture && <ArticlePicture
                        picture={getPreviewRendition(picture)}
                        isKilled={isKilled(item)}
                        caption={getCaption(picture)}/>}
                    <PreviewMeta item={item} isItemDetail={false} inputRef={previousVersions} displayUrgency={false}/>
                    <ArticleAbstract item={item} displayAbstract={DISPLAY_ABSTRACT}/>
                    <ArticleBodyHtml item={item}/>
                    <PreviewTags item={item} isItemDetail={false} displayGenre={false}/>
                    {showItemVersions(item) &&
                        <ListItemPreviousVersions
                            item={item}
                            isPreview={true}
                            inputId={previousVersions}
                        />
                    }
                </div>
            </Preview>
        );
    }
}

AmPreview.propTypes = {
    user: PropTypes.string,
    item: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    closePreview: PropTypes.func,
};

export default AmPreview;
