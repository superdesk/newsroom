import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import NavLink from './NavLink';

function NavigationTab({navigations, activeNavigation, toggleNavigation}) {
    const navLinks = navigations.map((navigation) => (
        <NavLink key={navigation.name}
            isActive={activeNavigation === navigation._id || navigations.length === 1}
            onClick={(event) => toggleNavigation(event, navigation)}
            label={navigation.name}
        />
    ));

    const all = (
        <NavLink key="all"
            isActive={!activeNavigation}
            onClick={(event) => toggleNavigation(event)}
            label={gettext('All')}
        />
    );

    return navLinks.length > 1 ? [all].concat(navLinks) : navLinks;
}

NavigationTab.propTypes = {
    navigations: PropTypes.arrayOf(PropTypes.object),
    activeNavigation: PropTypes.string,
    toggleNavigation: PropTypes.func.isRequired,
};

export default NavigationTab;
