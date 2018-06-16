import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function NavLink({isActive, onClick, label}) {
    return (
        <a href=''
            className={classNames('btn btn-block', {
                'btn-outline-primary': isActive,
                'btn-outline-secondary': !isActive,
            })}
            onClick={onClick}>{label}</a>
    );
}

NavLink.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
};

export default NavLink;
