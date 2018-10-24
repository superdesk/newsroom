import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';


function SectionFilterListItem({sectionFilter, isActive, onClick}) {
    return (
        <tr key={sectionFilter._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(sectionFilter._id)}>
            <td className="name">{sectionFilter.name}</td>
            <td>{(sectionFilter.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{gettext(sectionFilter.sd_sectionFilter_id)}</td>
            <td>{gettext(sectionFilter.query)}</td>
            <td>{shortDate(sectionFilter._created)}</td>
        </tr>
    );
}

SectionFilterListItem.propTypes = {
    sectionFilter: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default SectionFilterListItem;