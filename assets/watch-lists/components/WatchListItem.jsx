import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import {get} from 'lodash';


function WatchListItem({watchList, isActive, onClick, companiesById}) {
    return (
        <tr key={watchList._id}
            className={`${isActive?'table--selected':''}
            ${(watchList.company && companiesById[watchList.company] && !get(companiesById[watchList.company],'is_enabled')) || !watchList.is_enabled?'table-secondary':null}`}
            onClick={() => onClick(watchList._id)}>
            <td className="name">{watchList.name}</td>
            <td>{watchList.subject}</td>
            <td>{watchList.description}</td>
            <td>{watchList.query}</td>
            <td>{(watchList.company && companiesById ? get(companiesById[watchList.company],'name') : null)}</td>
            <td>{(watchList.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
        </tr>
    );
}

WatchListItem.propTypes = {
    watchList: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    companiesById: PropTypes.object,
};

export default WatchListItem;
