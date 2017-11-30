import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

class SelectedItemsBar extends React.Component {
    constructor(props) {
        super(props);
        this.onAction = this.onAction.bind(this);
    }

    onAction(event, action) {
        event.preventDefault();
        action.action(this.props.selectedItems) && this.props.selectNone();
    }

    render() {
        const actions = this.props.actions.map((action) => (
            <button className='icon-button'
                key={action.name}
                onClick={(e) => this.onAction(e, action)}
            >
                <i className={`icon--${action.icon}`}></i>
            </button>
        ));
        return (
            <div className='multi-action-bar multi-action-bar--open'>
                <button className='btn btn-outline-secondary btn-responsive'
                    onClick={this.props.selectNone}>{gettext('Cancel')}
                </button>
                <button className='btn btn-outline-primary btn-responsive'
                    onClick={this.props.selectAll}>{gettext('Select All')}
                </button>
                <span className='multi-action-bar__count'>
                    {gettext('{{ count }} item(s) selected', {count: this.props.selectedItems.length})}
                </span>
                <div className='multi-action-bar__icons'>
                    {actions}
                </div>
            </div>
        );
    }
}

SelectedItemsBar.propTypes = {
    selectedItems: PropTypes.array.isRequired,
    selectAll: PropTypes.func.isRequired,
    selectNone: PropTypes.func.isRequired,
    actions: PropTypes.array.isRequired,
};

export default SelectedItemsBar;
