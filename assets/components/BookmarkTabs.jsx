import React from 'react';
import PropTypes from  'prop-types';
import {gettext} from 'utils';

export default function BookmarkTabs(props) {
    const buttons = [
        {
            id: 'wire',
            href: '/bookmarks',
            label: gettext('Wire'),
        },
        {
            id: 'agenda',
            href: '/bookmarks_agenda',
            label: gettext('Agenda'),
        },
        {
            id: 'am_news',
            href: '/bookmarks_am_news',
            label: gettext('AM News'),
        },
    ];

    const sections = buttons.map((btn) =>
        (
            props.sections[btn.id] ?
                <a key={btn.id}
                    className={'btn btn-outline-primary' + (btn.id === props.active ? ' active' : '')}
                    href={btn.href}>{btn.label}</a> : null
        )
    ).filter((btn) => btn);

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