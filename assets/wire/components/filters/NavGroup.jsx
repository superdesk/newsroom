import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

function NavGroup({label, children}) {
    return (
        <div className='wire-column__nav__group'>
            <h6>{gettext(label)}</h6>
            {children}
        </div>
    );
}

NavGroup.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export default NavGroup;
