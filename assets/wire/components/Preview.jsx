import React from 'react';
import PropTypes from 'prop-types';

import { gettext, fullDate, wordCount } from 'utils';

const DEFAULT_URGENCY = 4;

function formatCV(items) {
    return items && items.map((item) => (
        <span key={item.code} className="badge badge-secondary mr-1">{item.name} </span>
    ));
}

function Preview({item, actions}) {
    const actionButtons = actions.map((action) => {
        if (action.url) {
            return (
                <a className="btn btn-outline-primary"
                    key={action.name}
                    href={action.url(item)}
                    download={action.download && action.download(item)}
                    target={action.target}
                >{action.name}</a>
            );
        }

        return (
            <button className="btn btn-outline-primary"
                key={action.name}
                onClick={() => action.action(item)}
            >{action.name}</button>
        );
    });

    const genres = item.genre && formatCV(item.genre);
    const subjects = item.subject && formatCV(item.subject);

    return (
        <div className="col">
            <nav className="navbar">
                {actionButtons}
            </nav>
            <article id="preview-article" className="preview">
                <time>{gettext('Created {{ date }}', {date: fullDate(item.versioncreated)})}</time>
                <h5>{item.slugline}</h5>
                <h2 id="preview-headline">{item.headline}</h2>
                <p className="byline">{gettext('By: {{ byline }}', {byline: item.byline})}</p>
                <blockquote>
                    {gettext('News Value: {{ value }}', {value: item.urgency || DEFAULT_URGENCY})}<br />
                    <b>{wordCount(item.body_html)}</b> {gettext('words')}<br />
                    {gettext('Source: {{ source }}', {source: item.source})}<br />
                </blockquote>
                <p id="preview-lead" className="lead">{item.description_text}</p>
                {item.body_html &&
                    <div id="preview-body" dangerouslySetInnerHTML={({__html: item.body_html})} />
                }
                {subjects &&
                    <div><b>{gettext('CATEGORY')}</b><br />{subjects}</div>
                }
                {genres &&
                    <div><b>{gettext('GENRE')}</b><br />{genres}</div>
                }
            </article>
        </div>
    );
}

Preview.propTypes = {
    item: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
};

export default Preview;
