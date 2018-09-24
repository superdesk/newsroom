import React from 'react';
import PropTypes from 'prop-types';
import { gettext, isDisplayed } from 'utils';
import InfoBox from './InfoBox';
import PreviewTagsBlock from './PreviewTagsBlock';
import PreviewTagsLink from './PreviewTagsLink';

function formatCV(items, field) {
    return items && items.map((item) => (
        <PreviewTagsLink key={item.code}
            href={`/wire?q=${field}:"${item.name}"`}
            text={item.name}
        />
    ));
}

function PreviewTags({item, isItemDetail, displayConfig}) {
    const genres = item.genre && formatCV(item.genre, 'genre.name');
    const subjects = item.subject && formatCV(item.subject, 'subject.name');

    return (
        <InfoBox label={isItemDetail ? gettext('Metadata') : null} top={!isItemDetail}>
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
