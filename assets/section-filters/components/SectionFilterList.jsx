import React from 'react';
import PropTypes from 'prop-types';
import SectionFilterListItem from './SectionFilterListItem';
import { gettext } from 'utils';


function SectionFilterList({sectionFilters, onClick, activeSectionFilterId}) {
    const list = sectionFilters.map((sectionFilter) =>
        <SectionFilterListItem
            key={sectionFilter._id}
            sectionFilter={sectionFilter}
            onClick={onClick}
            isActive={activeSectionFilterId===sectionFilter._id}/>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Status') }</th>
                            <th>{ gettext('Superdesk Product Id') }</th>
                            <th>{ gettext('Query') }</th>
                            <th>{ gettext('Created On') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

SectionFilterList.propTypes = {
    sectionFilters: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeSectionFilterId: PropTypes.string
};

export default SectionFilterList;