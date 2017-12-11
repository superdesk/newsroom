import React from 'react';
import PropTypes from 'prop-types';

function UserProfileAvatar({user}) {
    const initials = [user.first_name, user.last_name]
        .map((name) => name[0].toLocaleUpperCase())
        .join('');
    return (
        <div className="profile__group profile__group--dark-bck">
            <figure className="profile__avatar initials">
                <span className="profile__characters">{initials}</span>
            </figure>
            <div className="profile__name-container">
                <h5 className="profile__name">{`${user.first_name} ${user.last_name}`}</h5>
                {user.username && <span className="profile__info">{user.username}</span>}
            </div>
        </div>
    );
}

UserProfileAvatar.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
    }),
};

export default UserProfileAvatar;
