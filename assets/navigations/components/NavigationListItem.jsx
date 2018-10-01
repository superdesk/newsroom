import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';


function NavigationListItem({navigation, isActive, onClick}) {
    return (
        <tr key={navigation._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(navigation._id)}>
            <td className="name">{navigation.name}</td>
            <td>{navigation.description}</td>
            <td>{(navigation.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{shortDate(navigation._created)}</td>
        </tr>
    );
}

NavigationListItem.propTypes = {
    navigation: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default NavigationListItem;