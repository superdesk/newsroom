import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, isInPast } from 'utils';
import { getCountryLabel } from '../utils';

function CompanyListItem({company, type, isActive, onClick}) {
    return (
        <tr key={company._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(company._id)}>
            <td className="name">{company.name}</td>
            <td className="type">{type ? type.name : ''}</td>
            <td>{company.sd_subscriber_id}</td>
            <td className={isInPast(company.expiry_date) ? 'text-danger' : null}>
                {(company.is_enabled ? gettext('Enabled') : gettext('Disabled'))}
            </td>
            <td>{company.contact_name}</td>
            <td>{company.phone}</td>
            <td>{getCountryLabel(company.country)}</td>
            <td>{shortDate(company._created)}</td>
            <td>{company.expiry_date && shortDate(company.expiry_date)}</td>
        </tr>
    );
}

CompanyListItem.propTypes = {
    company: PropTypes.object,
    type: PropTypes.shape({
        name: PropTypes.string.isRequired,
    }),
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default CompanyListItem;
