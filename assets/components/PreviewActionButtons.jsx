import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';


function PreviewActionButtons({item, user, actions, plan, group}) {
    const actionButtons = actions.map((action) =>
        <ActionButton
            key={action.name}
            item={item}
            className='icon-button'
            isVisited={action.visited && action.visited(user, item)}
            displayName={false}
            action={action}
            plan={plan}
            group={group}
        />
    );

    return (
        <div className='wire-column__preview__buttons'>
            {actionButtons}
        </div>
    );
}

PreviewActionButtons.propTypes = {
    item: PropTypes.object,
    user: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    plan: PropTypes.string,
    group: PropTypes.string,
};

export default PreviewActionButtons;
