import React from 'react';
import PropTypes from 'prop-types';
import MonitoringItem from './MonitoringItem';
import { gettext } from 'utils';


function MonitoringList({list, onClick, activeMonitoringProfileId, companiesById}) {
    const listElement = list.map((m) =>
        <MonitoringItem
            key={m._id}
            item={m}
            onClick={onClick}
            isActive={activeMonitoringProfileId===m._id}
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
                    <tbody>{listElement}</tbody>
                </table>
            </div>
        </section>
    );
}

MonitoringList.propTypes = {
    list: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeMonitoringProfileId: PropTypes.string,
    companiesById: PropTypes.object,
};

export default MonitoringList;
