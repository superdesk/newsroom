import React from 'react';
import PropTypes from 'prop-types';

import { gettext, fullDate } from 'utils';

function Preview({item, actions}) {
    const actionButtons = actions.map((action) => {
        if (action.url) {
            return (
                <a className="btn btn-outline-primary"
                    key={action.name}
                    href={action.url(item)}
                    download={action.download(item)}
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
                <p id="preview-lead" className="lead">{item.description_text}</p>
                {item.body_html &&
                    <div id="preview-body" dangerouslySetInnerHTML={({__html: item.body_html})} />
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
