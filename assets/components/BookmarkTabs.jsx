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
    ];

    return (
        <div className="btn-group btn-group--navbar ml-3 mr-3">
            {buttons.map((btn) => (
                <a key={btn.id}
                    className={'btn btn-outline-primary' + (btn.id === props.active ? ' active' : '')}
                    href={btn.href}>{btn.label}</a>
            ))}
        </div>
    );
}

BookmarkTabs.propTypes = {
    active: PropTypes.string.isRequired,
};