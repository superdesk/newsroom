import React from 'react';
import PropTypes from 'prop-types';
import ReportsTable from './ReportsTable';

import { gettext } from 'utils';


function getProductDetails(products) {
    return (products.map((product) => (<div key={product._id} className="d-flex align-items-center m-2">
        <div><span className="font-italic">{gettext('Product name')}:</span> {product.name}</div>
        <div className="ml-3"><span className="font-italic">{gettext('Is enabled')}:</span>{product.is_enabled.toString()}</div>
        {product.query && <div className="ml-3"><span className="font-italic">{gettext('Query')}:</span>{product.query}</div>}
        {product.sd_product_id && <div className="ml-3"><span className="font-italic">{gettext('sd_product_id')}:</span>{product.sd_product_id}</div>}
    </div>)));
}

function CompanyProducts({data, print}) {

    const list = data.results && data.results.map((item) =>
        [<tr key={item._id} className="table-secondary">
            <td>{item.name}</td>
            <td>{item.is_enabled.toString()}</td>
            <td>{item.products.length}</td>
        </tr>,
        <tr key={`${item._id}-products`}>
            <td colSpan="3">
                {getProductDetails(item.products)}
            </td>
        </tr>]
    );

    const headers = [gettext('Company'), gettext('Is Enabled'), gettext('Number Of Products')];
    return data.results ? (<ReportsTable headers={headers} rows={list} print={print} />) : null;
}

CompanyProducts.propTypes = {
    data: PropTypes.object.isRequired,
    print: PropTypes.bool,
};

export default CompanyProducts;