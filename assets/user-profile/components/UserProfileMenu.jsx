import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';


function UserProfileMenu({isProfile, isFollowedTopics, isDownloadHistory, onClick}) {
    return (
        <ul>
            <li>
                <a className={`side-navigation__btn ${isProfile?'active':null}`}
                    href='#'
                    name='profile'>{gettext('My Profile')}</a>
            </li>
            <li>
                <a className={`side-navigation__btn ${isFollowedTopics?'active':null}`}
                    href='#'
                    name='topics'
                    onClick={onClick}>{gettext('Followed Topics')}</a>
            </li>
            <li>
                <a className={`side-navigation__btn ${isDownloadHistory?'active':null}`}
                    href='#'
                    name='history'>{gettext('Download History')}</a>
            </li>
        </ul>
    );
}

UserProfileMenu.propTypes = {
    isProfile: PropTypes.bool,
    isFollowedTopics: PropTypes.bool,
    isDownloadHistory: PropTypes.bool,
    onClick: PropTypes.func
};

export default UserProfileMenu;
