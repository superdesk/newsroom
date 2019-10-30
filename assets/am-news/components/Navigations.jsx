import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get} from 'lodash';

import {gettext} from 'utils';


const Navigations = ({navigations=[], activeNavigation, toggleNavigation, fetchItems}) => {

    const tabs = navigations.map((navigation) => (
        <li className="nav-item" key={navigation.name}>
            <a href=""
                className={classNames(
                    'nav-link',
                    {active: get(activeNavigation, '[0]') === navigation._id}
                )}
                onClick={(event) => {
                    event.preventDefault();
                    toggleNavigation(navigation);
                    fetchItems();
                }}>{gettext(navigation.name)}</a>
        </li>
    ));

    return (
        <ul
            className="nav nav-tabs nav-fill flex-grow-1 px-3 am-news__nav-tabs">
            {tabs}
        </ul>
    );

};

Navigations.propTypes = {
    navigations: PropTypes.arrayOf(PropTypes.object.isRequired),
    activeNavigation: PropTypes.arrayOf(PropTypes.string),
    toggleNavigation: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
};

export default Navigations;
