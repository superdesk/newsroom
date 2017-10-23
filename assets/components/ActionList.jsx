import React from 'react';
import PropTypes from 'prop-types';


function ActionList({item, actions}) {
    return (
        <div className='dropdown-menu dropdown-menu-right show'>
            {actions.map((action) =>
                <button
                    key={action.name}
                    type='button'
                    className='dropdown-item'
                    onClick={() => action.action(action.multi ? [item._id] : item)}>
                    <i className={`icon--${action.icon}`}></i>
                    {action.name}</button>
            )}
        </div>
    );
}

ActionList.propTypes = {
    item: PropTypes.object,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    }))
};

export default ActionList;
