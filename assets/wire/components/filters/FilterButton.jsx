import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { gettext } from 'utils';
import NavLink from './NavLink';

export default function FilterButton({label, onClick, className, primary}) {
    return (
        <div className={classnames('filter-button', className)}>
            <NavLink isActive={primary} onClick={onClick} label={gettext(label)} />
        </div>
    );
}

FilterButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    primary: PropTypes.bool,
};
