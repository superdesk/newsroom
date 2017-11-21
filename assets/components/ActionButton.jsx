import React from 'react';
import PropTypes from 'prop-types';


function ActionButton({item, className, displayName, action}) {
    return (
        <button
            type='button'
            className={className}
            onClick={() => action.action(action.multi ? [item._id] : item)}
            title={!displayName && action.name}>
            <i className={`icon--${action.icon}`}></i>
            {displayName && action.name}</button>
    );
}

ActionButton.propTypes = {
    item: PropTypes.object,
    className: PropTypes.string,
    displayName: PropTypes.bool,
    action: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    })
};

export default ActionButton;
