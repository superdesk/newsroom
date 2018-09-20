import React from 'react';
import PropTypes from 'prop-types';

export default function PreviewTagsLink(props) {
    return (
        <a className="wire-column__preview__tag"
            href={props.href}
        >{props.text}</a>
    );
}

PreviewTagsLink.propTypes = {
    href: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
};