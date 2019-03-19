import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function ReportsTable({headers, rows, print}) {
    return (
        <section className="content-main">
            <div className="list-items-container reports-container">
                <table className="table table-bordered">
                    <thead className={classNames({'report-thead': !print}, 'thead-dark')}>
                        <tr>
                            {headers.map((h, i) => (<th key={i}>{h}</th>))}
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        </section>
    );
}

ReportsTable.propTypes = {
    data: PropTypes.object.isRequired,
    print: PropTypes.bool,
    headers: PropTypes.array,
    rows: PropTypes.array,
};

export default ReportsTable;
