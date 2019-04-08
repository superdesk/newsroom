import React from 'react';
import PropTypes from  'prop-types';
import {gettext} from '../utils';


export default function BookmarkTabs(props) {
    const sections = Object.keys(props.sections).map((id) => {
        const section = props.sections[id];

        return <a key={section._id}
            className={'btn btn-outline-primary' + (section._id === props.active ? ' active' : '')}
            href={`/bookmarks_${section._id}`}>{gettext(section.name)}</a>;
    });

    if (sections.length < 2) {
        return null;
    }

    return (
        <div className="btn-group btn-group--navbar ml-3 mr-3">
            {sections}
        </div>
    );
}

BookmarkTabs.propTypes = {
    active: PropTypes.string.isRequired,
    sections: PropTypes.object.isRequired,
};