import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';


function ActionList({item, actions}) {
    return (
        <div className='dropdown-menu dropdown-menu-right show'>
            {actions.map((action) =>
                <ActionButton
                    key={action.name}
                    action={action}
                    className='dropdown-item'
                    displayName={true}
                    item={item}
                />
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
