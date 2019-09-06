import React from 'react';
import PropTypes from 'prop-types';
import ReportsTable from './ReportsTable';

import { gettext } from 'utils';


function ProductStories({results, print}) {
    const list = results && results.map((item) =>
        <tr key={item._id}>
            <td>{item.name}</td>
            <td>{item.is_enabled.toString()}</td>
            <td>{item.today}</td>
            <td>{item.last_24_hours}</td>
            <td>{item.this_week}</td>
            <td>{item.last_7_days}</td>
            <td>{item.this_month}</td>
            <td>{item.previous_month}</td>
            <td>{item.last_6_months}</td>
        </tr>
    );

    const headers = [
        gettext('Product'),
        gettext('Is Enabled'),
        gettext('Today'),
        gettext('Last 24 hours'),
        gettext('This week'),
        gettext('Last 7 days'),
        gettext('This month'),
        gettext('Previous month'),
        gettext('Last 6 months'),
    ];
    return results ? (<ReportsTable headers={headers} rows={list} print={print} />) : null;
}

ProductStories.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
};

export default ProductStories;