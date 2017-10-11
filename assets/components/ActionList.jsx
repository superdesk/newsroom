import React from 'react';
import PropTypes from 'prop-types';
import CloseButton from './CloseButton';


function ActionList({item, actions, onClose}) {
    return (
        <div className="wire-articles__item--list__actions">
            <CloseButton onClick={onClose}/>
            <div className="list-group">
                {actions.map((action) =>
                    <button
                        key={action.name}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => action.action(action.multi ? [item._id] : item)}>{action.name}</button>
                )}
            </div>
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
