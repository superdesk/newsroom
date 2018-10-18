import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

export default function ArticleAuthor({item}) {
    return (
        (item.byline || item.located) && (
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
        ) || null
    );
}

ArticleAuthor.propTypes = {
    item: PropTypes.object.isRequired,
};