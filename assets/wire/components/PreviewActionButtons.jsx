import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from '../../components/ActionButton';


function PreviewActionButtons({item, actions}) {
    const actionButtons = actions.map((action) =>
        <ActionButton
            key={action.name}
            item={item}
            className='icon-button'
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
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    }))
};

export default PreviewActionButtons;
