import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext, shortDate, fullDate } from 'utils';

function wordCount(html) {
    return html && html.split(' ').filter(x => x.trim()).length || 0;
}

function WireListItem({item, onClick}) {
    const count = wordCount(item.body_html);
    const slugline = item.slugline && item.slugline.trim() || item.headline.replace(/ /g, '-');
    return (
        <article key={item._id}
            className={classNames('card', 'list', 'mb-3')}
            tabIndex="0"
            onClick={(event) => event.target.focus()}
            onFocus={() => onClick(item._id)}>
            <div className="card-body">
                <h4 className="card-title">{item.headline}</h4>
                <h6 className="card-subtitle">{slugline}</h6>
                <small className="card-subtitle">
                    {gettext('Source: {{ source }}', {source: item.source})}
                    {' // '}
                    <b>{count}</b> {gettext('words')}
                    {' // '}
                    <time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                </small>
                <p className="card-text">{item.description_text}</p>
            </div>
        </article>
    );
}

WireListItem.propTypes = {
    item: PropTypes.object,
    onClick: PropTypes.func,
};

export default WireListItem;
