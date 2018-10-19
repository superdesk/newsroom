import React from 'react';
import PropTypes from 'prop-types';
import { formatHTML } from 'utils';

export default function ArticleBodyHtml({item}) {
    return (
        item.body_html &&
        <div
            className='wire-column__preview__text'
            id='preview-body'
            dangerouslySetInnerHTML={({__html: formatHTML(item.body_html)})} /> || null

    );
}

ArticleBodyHtml.propTypes = {
    item: PropTypes.object.isRequired,
};