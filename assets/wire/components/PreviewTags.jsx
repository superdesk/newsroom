import React from 'react';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import { gettext, isDisplayed } from 'utils';
import InfoBox from './InfoBox';
import PreviewTagsBlock from './PreviewTagsBlock';
import PreviewTagsLink from './PreviewTagsLink';
import ArticleSlugline from 'ui/components/ArticleSlugline';


function formatCV(items, field) {
    return items && uniqBy(items, (item) => item.code).map((item) => (
        <PreviewTagsLink key={item.code}
            href={'/wire?filter=' + encodeURIComponent(JSON.stringify({[field]: [item.name]}))}
            text={item.name}
        />
    ));
}

function PreviewTags({item, isItemDetail, displayConfig}) {
    const genres = item.genre && formatCV(item.genre, 'genre');
    const subjects = item.subject && formatCV(item.subject, 'subject');

    return (
        <InfoBox label={isItemDetail ? gettext('Metadata') : null} top={!isItemDetail}>
            {isDisplayed('slugline', displayConfig) && (
                <PreviewTagsBlock label={gettext('Slugline')}>
                    <ArticleSlugline item={item}/>
                </PreviewTagsBlock>)}

            {subjects && isDisplayed('subjects', displayConfig) &&
                <PreviewTagsBlock label={gettext('Category')}>
                    {subjects}
                </PreviewTagsBlock>
            }

            {genres && isDisplayed('genre', displayConfig) &&
                <PreviewTagsBlock label={gettext('Content Type')}>
                    {genres}
                </PreviewTagsBlock>
            }
        </InfoBox>
    );
}

PreviewTags.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
    displayConfig: PropTypes.object,
};

export default PreviewTags;
