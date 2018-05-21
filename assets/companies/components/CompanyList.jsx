import React from 'react';
import PropTypes from 'prop-types';
import CompanyListItem from './CompanyListItem';
import { gettext } from 'utils';


function CompanyList({companies, onClick, activeCompanyId}) {
    const list = companies.map((company) =>
        <CompanyListItem
            key={company._id}
            company={company}
            onClick={onClick}
            isActive={activeCompanyId===company._id}/>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Superdesk Subscriber Id') }</th>
                            <th>{ gettext('Status') }</th>
                            <th>{ gettext('Contact') }</th>
                            <th>{ gettext('Telephone') }</th>
                            <th>{ gettext('Country') }</th>
                            <th>{ gettext('Created On') }</th>
                            <th>{ gettext('Expires On') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

CompanyList.propTypes = {
    companies: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeCompanyId: PropTypes.string
};

export default CompanyList;
