import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import classNames from 'classnames';

const getActiveFilterLabel = (filter, activeFilter, isActive) => {
    return isActive ? activeFilter[filter.field][0] : gettext(filter.label);
};

function AgendaFilterButton({filter, activeFilter}) {
    const isActive = activeFilter[filter.field];
    return (<button
        id={filter.field}
        type='button'
        className={classNames('btn btn-outline-primary btn-sm d-flex align-items-center px-2 ml-2',
            {'active': isActive})}
        data-toggle='dropdown'
        aria-haspopup='true'
        aria-expanded='false'>
        <i className={`${filter.icon} d-sm-none`}></i>
        <span className='d-none d-sm-block'>{getActiveFilterLabel(filter, activeFilter, isActive)}</span>
        <i className={classNames('icon-small--arrow-down ml-1', {'icon--white': isActive})}></i>
    </button>);
}

AgendaFilterButton.propTypes = {
    filter: PropTypes.object,
    activeFilter: PropTypes.object,
};

export default AgendaFilterButton;
