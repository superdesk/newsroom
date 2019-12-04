import React from 'react';
import PropTypes from 'prop-types';
import { gettext, formatDate } from 'utils';
import { get, groupBy } from 'lodash';
import ReportsTable from './ReportsTable';


function getProductDetails(products = []) {
    const productsByGroup = groupBy(products, (p) => p.product_type);
    const getProductSectionName = (productType) => {
        if (productType === 'am_news') {
            return gettext('AM');
        }

        if (productType !== 'aapX') {
            return productType.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
        }

        return productType;
    };

    return (
        <div className="m-2">
            <div><span className="font-italic">{gettext('Products')}: </span></div>
            {Object.keys(productsByGroup).map((productType) =>
                <div className='pl-3' key={productType}>{getProductSectionName(productType)}
                    <div className='pl-3'>{productsByGroup[productType].map((p) => <div key={p._id}>{p.name}</div>)}</div>
                </div>
            )}
        </div>);
}

function getContactDetails(company) {
    const contactInfo = company.contact_email ? `${company.contact_name} (${company.contact_email})` : company.contact_name;
    return (
        <div className="d-flex align-items-center m-2">
            <div><span className="font-italic">{gettext('Contact')}: </span>{contactInfo}</div>
            <div className="ml-3"><span className="font-italic">{gettext('Tel')}: </span>{company.phone || '-'}</div>
        </div>);
}

function getUsers(users = []) {
    const usersInfo = users.length <= 0 ? '-' : users.map((u) =>
        `${u.first_name} ${u.last_name} (${u.email})`).join(', ');

    return (
        <div className="d-flex align-items-center m-2">
            <div><span className="font-italic">{gettext('User Accounts')}: </span>{usersInfo}</div>
        </div>);
}

function Company({results, print}) {

    const list = results && results.map((item) =>
        [<tr key={item._id} className="table-secondary">
            <td>{item.name}</td>
            <td className='font-weight-bold'>{item.is_enabled ? gettext('Active') : gettext('Disabled')}</td>
            <td>{formatDate(get(item, 'company._created'))}</td>
            <td>{get(item, 'company.expiry_date') ? formatDate(item.company.expiry_date) : gettext('Unspecified')}</td>
        </tr>,
        <tr key={`${item._id}-contact`}>
            <td colSpan="4">
                {getContactDetails(item.company)}
            </td>
        </tr>,
        <tr key={`${item._id}-account_manager`}>
            <td colSpan="4">
                <div className="d-flex align-items-center m-2">
                    <div><span className="font-italic">{gettext('Account Manager')}: </span>
                        {item.account_manager}</div>
                </div>
            </td>
        </tr>,
        <tr key={`${item._id}-users`}>
            <td colSpan="5">
                {getUsers(item.users)}
            </td>
        </tr>,
        <tr key={`${item._id}-products`}>
            <td colSpan="5">
                {getProductDetails(item.products)}
            </td>
        </tr>]
    );

    const headers = [gettext('Company'), gettext('Is Active'), gettext('Created'), gettext('Expiry Date')];
    return results ? (<ReportsTable headers={headers} rows={list} print={print} />) : null;
}

Company.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
};

export default Company;
