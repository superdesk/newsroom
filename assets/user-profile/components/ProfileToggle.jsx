import React from 'react';
import PropTypes from 'prop-types';

function ProfileToggle({user, onClick}) {
    const initials = user.first_name[0].toLocaleUpperCase() + user.last_name[0].toLocaleUpperCase();

    return (
        <div className="header-profile" onClick={(event) => {
            event.preventDefault();
            onClick();
        }}>
            <figure className="header-profile__avatar">
                <span className="header-profile__characters"
                    data-toggle='tooltip'
                    data-placement='left'
                    title={`${user.first_name} ${user.last_name}`}
                >{initials}</span>
            </figure>
        </div>
    );
}

ProfileToggle.propTypes = {
    user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

export default ProfileToggle;
