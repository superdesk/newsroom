import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';


function NavigationListItem({navigation, productTypes, isActive, onClick}) {
    return (
        <tr key={navigation._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(navigation._id)}>
            <td className="name">{navigation.name}</td>
            <td>{navigation.description}</td>
            <td>{productTypes}</td>
            <td>{(navigation.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{shortDate(navigation._created)}</td>
        </tr>
    );
}

NavigationListItem.propTypes = {
    navigation: PropTypes.object,
    productTypes: PropTypes.string,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default NavigationListItem;