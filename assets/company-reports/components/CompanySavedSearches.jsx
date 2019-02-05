import React from 'react';
import PropTypes from 'prop-types';
import ReportsTable from './ReportsTable';

import { gettext } from 'utils';


function CompanySavedSearches({data, print}) {
    const list = data.results && data.results.map((item) =>
        <tr key={item._id}>
            <td>{item.name}</td>
            <td>{item.is_enabled.toString()}</td>
            <td>{item.topic_count}</td>
        </tr>
    );

    const headers = [gettext('Company'), gettext('Is Enabled'), gettext('Number Of Saved Searches')];
    return data.results ? (<ReportsTable headers={headers} rows={list} print={print} />) : null;
}

CompanySavedSearches.propTypes = {
    data: PropTypes.object.isRequired,
    print: PropTypes.bool,
};

export default CompanySavedSearches;