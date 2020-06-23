import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import AgendaFilterButton from './AgendaFilterButton';

function AgendaEventsOnlyFilter ({toggleFilter, eventsOnlyView}) {
    const eventOnlyLabel = gettext('Show Events Only');
    const filter = {
        label: gettext('Events & Coverages'),
        field: 'eventsOnly',
        icon: 'icon-small--coverage-infographics'
    };

    return (<div className="btn-group" key={filter.field}>
        <AgendaFilterButton
            filter={filter}
            activeFilter={eventsOnlyView ? {[filter.field]: [eventOnlyLabel]} : {}}
        />
        <div className='dropdown-menu' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, false)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            <button
                key='coverage-planned'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, true)}
            >{eventOnlyLabel}
            </button>
        </div>
    </div>);
}

AgendaEventsOnlyFilter.propTypes = {
    toggleFilter: PropTypes.func,
    eventsOnlyView: PropTypes.bool,
};


export default AgendaEventsOnlyFilter;
