import React from 'react';
import PropTypes from 'prop-types';
import { gettext, isDisplayed } from 'utils';

export default function ArticleAuthor({item, displayConfig}) {
    return (
        (item.byline || item.located) && (
            <p className='wire-column__preview__author'>
                {isDisplayed('byline', displayConfig) && item.byline && (
                    <span>{!item.byline.toLowerCase().startsWith('by ') ? gettext('By ') : ''}
                        <b>{item.byline}</b>{' '}
                    </span>
                )}
                {isDisplayed('located', displayConfig) && item.located && (
                    <span>{gettext('in {{ located}}', {located: item.located})}</span>
                )}
            </p>
        ) || null
    );
}

ArticleAuthor.propTypes = {
    item: PropTypes.object.isRequired,
    displayConfig: PropTypes.object,
};