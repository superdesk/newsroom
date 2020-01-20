import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function ReportsTable({headers, rows, print, onScroll, tableClass}) {
    return (
        <section className="content-main">
            <div className="list-items-container reports-container" onScroll={onScroll}>
                <table className={classNames(
                    'table',
                    'table-bordered',
                    {[tableClass]: tableClass}
                )}>
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
    print: PropTypes.bool,
    headers: PropTypes.array,
    rows: PropTypes.array,
    onScroll: PropTypes.func,
    tableClass: PropTypes.string,
};

export default ReportsTable;
