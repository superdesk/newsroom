import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

function Preview({item}) {
    return (
        <div className="col">
            <article className="preview">
                <h2>{item.headline}</h2>
                <p className="byline">{gettext('By: {{ byline }}', {byline: item.byline})}</p>
                <p className="lead">{item.description_text}</p>
                {item.body_html &&
                    <div dangerouslySetInnerHTML={({__html: item.body_html})} />
                }
            </article>
        </div>
    );
}

Preview.propTypes = {
    item: PropTypes.object.isRequired,
};

export default Preview;
