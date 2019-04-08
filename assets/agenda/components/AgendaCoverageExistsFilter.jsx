import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import AgendaFilterButton from './AgendaFilterButton';

const filter = {
    label: gettext('Any coverage status'),
    field: 'coverage_status',
    nestedField: 'coverage_status',
    icon: 'icon-small--coverage-unrecognized',
};

function AgendaCoverageExistsFilter ({toggleFilter, activeFilter}) {
    return (<div className="btn-group" key={filter.field}>
        <AgendaFilterButton
            filter={filter}
            activeFilter={activeFilter}
        />
        <div className='dropdown-menu' aria-labelledby={filter.field}>
            <button
                type='button'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, null)}
            >{gettext(filter.label)}</button>
            <div className='dropdown-divider'></div>
            <button
                key='coverage-planned'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, 'planned')}
            >{gettext('Coverage is planned')}
            </button>
            <button
                key='coverage-not-planned'
                className='dropdown-item'
                onClick={() => toggleFilter(filter.field, 'not planned')}
            >{gettext('Coverage not planned')}
            </button>
        </div>
    </div>);
}

AgendaCoverageExistsFilter.propTypes = {
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
};


export default AgendaCoverageExistsFilter;
