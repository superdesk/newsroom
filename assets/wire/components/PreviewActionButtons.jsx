import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from '../../components/ActionButton';


function PreviewActionButtons({item, user, actions}) {
    const actionButtons = actions.map((action) =>
        <ActionButton
            key={action.name}
            item={item}
            className='icon-button'
            isVisited={action.visited && action.visited(user, item)}
            displayName={false}
            action={action}
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
    }))
};

export default PreviewActionButtons;
