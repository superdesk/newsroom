import React from 'react';
import PropTypes from 'prop-types';
import WatchListItem from './WatchListItem';
import { gettext } from 'utils';


function WatchList({watchLists, onClick, activeWatchListId, companiesById}) {
    const list = watchLists.map((w) =>
        <WatchListItem
            key={w._id}
            watchList={w}
            onClick={onClick}
            isActive={activeWatchListId===w._id}
            companiesById={companiesById} />
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Subject') }</th>
                            <th>{ gettext('Description') }</th>
                            <th>{ gettext('Query') }</th>
                            <th>{ gettext('Company') }</th>
                            <th>{ gettext('Status') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

WatchList.propTypes = {
    watchLists: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeWatchListId: PropTypes.string,
    companiesById: PropTypes.object,
};

export default WatchList;
