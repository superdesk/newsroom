import React from 'react';
import PropTypes from 'prop-types';
import { getEmbargo, gettext, fullDate } from '../../utils';

export default function ArticleEmbargoed({item}) {
    const embargo = getEmbargo(item);

    if (!embargo) {
        return null;
    }

    return (
        <div>
            <span className="label label--red label--big mb-3">{gettext('Embargo: {{ date }}', {date: fullDate(embargo)})}</span>
        </div>
    );
}

ArticleEmbargoed.propTypes = {
    item: PropTypes.shape({
        embargoed: PropTypes.string,
    }),
};
