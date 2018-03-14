import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';


function ProductStories({data}) {
    const list = data.results && data.results.map((item) =>
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

    return (
        <section className="content-main">
            <div className="list-items-container">
                {data.results && <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th>{ gettext('Product') }</th>
                            <th>{ gettext('Is Enabled') }</th>
                            <th>{ gettext('Today') }</th>
                            <th>{ gettext('Last 24 hours') }</th>
                            <th>{ gettext('This week') }</th>
                            <th>{ gettext('Last 7 days') }</th>
                            <th>{ gettext('This month') }</th>
                            <th>{ gettext('Previous month') }</th>
                            <th>{ gettext('Last 6 months') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>}
            </div>
        </section>
    );
}

ProductStories.propTypes = {
    data: PropTypes.object.isRequired,
};

export default ProductStories;