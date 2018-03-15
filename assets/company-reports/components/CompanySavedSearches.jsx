import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';


function CompanySavedSearches({data}) {
    const list = data.results && data.results.map((item) =>
        <tr key={item._id}>
            <td>{item.name}</td>
            <td>{item.is_enabled.toString()}</td>
            <td>{item.topic_count}</td>
        </tr>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                {data.results && <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th>{ gettext('Company') }</th>
                            <th>{ gettext('Is Enabled') }</th>
                            <th>{ gettext('Number Of Saved Searches') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>}
            </div>
        </section>
    );
}

CompanySavedSearches.propTypes = {
    data: PropTypes.object.isRequired,
};

export default CompanySavedSearches;