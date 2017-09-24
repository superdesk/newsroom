import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from '../../utils';


function SettingsMenu({isCompanySettings, isUserSettings, isSystemSettings, onClick}) {
    return (
        <ul className='nav flex-column'>
            <li className='nav-item'>
                <a className={`nav-link ${isCompanySettings?'active':null}`}
                    href='#'
                    name='companies'
                    onClick={onClick}>{gettext('Company Management')}</a>
            </li>
            <li className='nav-item'>
                <a className={`nav-link ${isUserSettings?'active':null}`}
                    href='#'
                    name='users'
                    onClick={onClick}>{gettext('User Management')}</a>
            </li>
            <li className='nav-item'>
                <a className={`nav-link ${isSystemSettings?'active':null}`}
                    href='#'
                    name='settings'>{gettext('System Settings')}</a>
            </li>
        </ul>
    );
}

SettingsMenu.propTypes = {
    isCompanySettings: PropTypes.bool,
    isUserSettings: PropTypes.bool,
    isSystemSettings: PropTypes.bool,
    onClick: PropTypes.func
};

export default SettingsMenu;
