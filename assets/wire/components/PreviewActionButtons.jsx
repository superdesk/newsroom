import React from 'react';
import PropTypes from 'prop-types';


function PreviewActionButtons({item, actions}) {
    const actionButtons = actions.map((action) => {
        const payload = action.multi ? [item._id] : item;
        return (
            <span className='wire-column__preview__icon'
                key={action.name}
                onClick={() => action.action(payload)}>
                <i className={`icon--${action.icon}`}></i>
            </span>
        );
    });

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
