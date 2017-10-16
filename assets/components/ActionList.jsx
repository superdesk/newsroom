import React from 'react';
import PropTypes from 'prop-types';
import CloseButton from './CloseButton';


function ActionList({item, actions, onClose}) {
    return (
        <div className='dropdown-menu dropdown-menu-right show'>
            <CloseButton onClick={onClose}/>
            {actions.map((action) =>
                <button
                    key={action.name}
                    type='button'
                    className='dropdown-item'
                    onClick={() => action.action(action.multi ? [item._id] : item)}>{action.name}</button>
            )}
        </div>
    );
}

ActionList.propTypes = {
    item: PropTypes.object,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    onClose: PropTypes.func
};

export default ActionList;
