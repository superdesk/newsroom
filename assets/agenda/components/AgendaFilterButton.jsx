import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

const getActiveFilterLabel = (filter, activeFilter) => {
    return activeFilter[filter.field] ? activeFilter[filter.field][0] : gettext(filter.label);
};

function AgendaFilterButton({filter, activeFilter}) {
    return (<button
        id={filter.field}
        type='button'
        className='btn btn-outline-primary btn-sm d-flex align-items-center px-2 ml-2'
        data-toggle='dropdown'
        aria-haspopup='true'
        aria-expanded='false'>
        <i className='icon-small--calendar d-sm-none'></i>
        <span className='d-none d-sm-block'>{getActiveFilterLabel(filter, activeFilter)}</span>
        <i className='icon-small--arrow-down ml-1'></i>
    </button>);
}

AgendaFilterButton.propTypes = {
    filter: PropTypes.object,
    activeFilter: PropTypes.object,
};

export default AgendaFilterButton;
