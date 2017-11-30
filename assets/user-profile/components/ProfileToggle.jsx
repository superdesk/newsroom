import React from 'react';
import PropTypes from 'prop-types';

function ProfileToggle({user, onClick}) {
    return (
        <a href="" onClick={(event) => {
            event.preventDefault();
            onClick();
        }}>
            <span className="badge badge-success">{`${user.first_name} ${user.last_name}`}</span>
        </a>
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
