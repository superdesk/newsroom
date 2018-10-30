import React from 'react';
import PropTypes from 'prop-types';
import NavigationListItem from './NavigationListItem';
import { gettext } from 'utils';


function NavigationList({navigations, onClick, activeNavigationId}) {
    const list = navigations.map((navigation) =>
        <NavigationListItem
            key={navigation._id}
            navigation={navigation}
            onClick={onClick}
            isActive={activeNavigationId===navigation._id}/>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Description') }</th>
                            <th>{ gettext('Status') }</th>
                            <th>{ gettext('Created On') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

NavigationList.propTypes = {
    navigations: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeNavigationId: PropTypes.string
};

export default NavigationList;