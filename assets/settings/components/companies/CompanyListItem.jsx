import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from '../../../utils';


function CompanyListItem({company, isActive, onClick}) {
    return (
        <tr key={company._id}
            className={isActive?'table-success':null}
            onClick={() => onClick(company._id)}>
            <td>{company.name}</td>
            <td>{company.sd_subscriber_id}</td>
            <td>{(company.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{company.contact_name}</td>
            <td>{company.phone}</td>
            <td>{company.country}</td>
            <td>{shortDate(company._created)}</td>
            <td>
                <button className="btn btn-sm delete-company"> {gettext('delete')}</button>
            </td>
        </tr>
    );
}

CompanyListItem.propTypes = {
    company: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default CompanyListItem;
