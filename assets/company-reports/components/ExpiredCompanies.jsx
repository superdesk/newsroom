import React from 'react';
import PropTypes from 'prop-types';
import {gettext, formatDate} from 'utils';
import {get} from 'lodash';
import ReportsTable from './ReportsTable';


function ExpiredCompanies({results, print}) {
    const list = results && results.map((item) =>
        <tr key={item._id}>
            <td>{get(item, 'name')}</td>
            <td className='font-weight-bold'>{item.is_enabled ? gettext('Active') : gettext('Disabled')}</td>
            <td>{formatDate(get(item, '_created'))}</td>
            <td>{get(item, 'expiry_date') ? formatDate(item.expiry_date) : gettext('Unspecified')}</td>
        </tr>
    );
    const headers = [gettext('Company'), gettext('Is Active'), gettext('Created'), gettext('Expiry Date')];
    return results ? (<ReportsTable headers={headers} rows={list} print={print}/>) : null;
}

ExpiredCompanies.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
};

export default ExpiredCompanies;