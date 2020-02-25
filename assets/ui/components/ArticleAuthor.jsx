import React from 'react';
import PropTypes from 'prop-types';
import { gettext, isDisplayed, fullDate } from 'utils';

export default function ArticleAuthor({item, isPreview, displayConfig}) {
    return (
        (item.byline || item.located || item.versioncreated) && (
            <p className='wire-column__preview__author'>
                {isDisplayed('byline', displayConfig) && item.byline && (
                    <span>{!item.byline.toLowerCase().startsWith('by ') ? gettext('By ') : ''}
                        {' '}<b>{item.byline}</b>{' '}
                    </span>
                )}
                {isPreview && isDisplayed('located', displayConfig) && item.located && (
                    <span>{gettext('in {{ located}}', {located: item.located})}</span>
                )}
                {item.versioncreated && (
                    <span>{`${gettext('on')} ${fullDate(item.versioncreated)}`}</span>
                )}
            </p>
        ) || null
    );
}

ArticleAuthor.propTypes = {
    item: PropTypes.object.isRequired,
    isPreview: PropTypes.bool.isRequired,
    displayConfig: PropTypes.object,
};
