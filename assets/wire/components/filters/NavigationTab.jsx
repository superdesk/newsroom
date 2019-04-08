import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import { connect } from 'react-redux';
import NavLink from './NavLink';

import { toggleNavigation } from 'search/actions';

function NavigationTab({navigations, activeNavigation, toggleNavigation, fetchItems, addAllOption}) {
    const navLinks = navigations.map((navigation) => (
        <NavLink key={navigation.name}
            isActive={activeNavigation === navigation._id || navigations.length === 1}
            onClick={(event) => {
                event.preventDefault();
                toggleNavigation(navigation);
                fetchItems();
            }}
            label={navigation.name}
        />
    ));

    const all = (
        <NavLink key="all"
            isActive={!activeNavigation}
            onClick={(event) => {
                event.preventDefault();
                toggleNavigation();
                fetchItems();
            }}
            label={gettext('All')}
        />
    );

    return navLinks.length > 1 && addAllOption ? [all].concat(navLinks) : navLinks;
}

NavigationTab.propTypes = {
    navigations: PropTypes.arrayOf(PropTypes.object),
    activeNavigation: PropTypes.string,
    toggleNavigation: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
    addAllOption: PropTypes.bool,
};

NavigationTab.defaultProps = { addAllOption: true };

const mapDispatchToProps = {
    toggleNavigation,
};

export default connect(null, mapDispatchToProps)(NavigationTab);
