import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

import NavLink from './NavLink';
import NavGroup from './NavGroup';

import { setCreatedFilter } from '../actions';

const shortcuts = [
    {label: gettext('Today'), value: 'now/d'},
    {label: gettext('This week'), value: 'now/w'},
    {label: gettext('This month'), value: 'now/M'},
];

function NavCreatedPicker({dispatch, createdFilter}) {
    const onClickFactory = (value) => (event) => {
        event.preventDefault();
        dispatch(setCreatedFilter({from: createdFilter.from === value ? null : value, to: null}));
    };

    const onInputChange = (event) => {
        dispatch(setCreatedFilter({[event.target.name]: event.target.value}));
    };

    const activeShortcut = shortcuts.find((shortcut) => shortcut.value === createdFilter.from);

    return (
        <NavGroup label={gettext('Published')}>
            {shortcuts.map((shortcut) => (
                <NavLink key={shortcut.value}
                    label={shortcut.label}
                    onClick={onClickFactory(shortcut.value)}
                    isActive={shortcut === activeShortcut}
                />
            ))}
            <div className="formGroup">
                <label htmlFor="created-from">{gettext('From')}</label>
                <input id="created-from" type="date" name="from"
                    className="form-control"
                    onChange={onInputChange}
                    value={activeShortcut ? '' : createdFilter.from || ''}
                />
            </div>
            <div className="formGroup">
                <label htmlFor="created-to">{gettext('To')}</label>
                <input id="created-to" type="date" name="to"
                    className="form-control"
                    onChange={onInputChange}
                    value={createdFilter.to || ''}
                />
            </div>
        </NavGroup>
    );
}

NavCreatedPicker.propTypes = {
    dispatch: PropTypes.func.isRequired,
    createdFilter: PropTypes.object.isRequired,
};

export default NavCreatedPicker;
