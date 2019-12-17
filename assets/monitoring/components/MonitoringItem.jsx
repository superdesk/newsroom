import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import {get} from 'lodash';


function MonitoringItem({item, isActive, onClick, companiesById}) {
    return (
        <tr key={item._id}
            className={`${isActive?'table--selected':''}
            ${(item.company && companiesById[item.company] && !get(companiesById[item.company],'is_enabled')) || !item.is_enabled?'table-secondary':null}`}
            onClick={() => onClick(item._id)}>
            <td className="name">{item.name}</td>
            <td>{item.subject}</td>
            <td>{item.description}</td>
            <td>{item.query}</td>
            <td>{(item.company && companiesById ? get(companiesById[item.company],'name') : null)}</td>
            <td>{(item.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
        </tr>
    );
}

MonitoringItem.propTypes = {
    item: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    companiesById: PropTypes.object,
};

export default MonitoringItem;
