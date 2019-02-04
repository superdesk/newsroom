import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';


function ActionList({item, group, plan, user, actions, onMouseLeave}) {
    return (
        <div onMouseLeave={onMouseLeave}>
            {actions.map((action) => !action.shortcut &&
                <ActionButton
                    key={action.name}
                    action={action}
                    className='dropdown-item'
                    isVisited={action.visited && action.visited(user, item)}
                    displayName={true}
                    item={item}
                    group={group}
                    plan={plan}
                />
            )}
        </div>
    );
}

ActionList.propTypes = {
    item: PropTypes.object,
    group: PropTypes.string,
    plan: PropTypes.object,
    user: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    })),
    onMouseLeave: PropTypes.func,
};

export default ActionList;
