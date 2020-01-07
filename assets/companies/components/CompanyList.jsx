import React from 'react';
import PropTypes from 'prop-types';
import CompanyListItem from './CompanyListItem';
import { gettext } from 'utils';


function CompanyList({companies, onClick, activeCompanyId, companyTypes, showSubscriberId}) {
    const list = companies.map((company) =>
        <CompanyListItem
            key={company._id}
            company={company}
            onClick={onClick}
            isActive={activeCompanyId===company._id}
            type={companyTypes.find((ctype) => ctype.id === company.company_type)}
            showSubscriberId={showSubscriberId}
        />
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Type') }</th>
                            {showSubscriberId && <th>{ gettext('Superdesk Subscriber Id') }</th>}
                            <th>{ gettext('Account Manager') }</th>
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
    activeCompanyId: PropTypes.string,
    companyTypes: PropTypes.array,
    showSubscriberId: PropTypes.bool,
};

export default CompanyList;
