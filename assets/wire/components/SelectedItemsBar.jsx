import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

class SelectedItemsBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const actionButtons = this.props.actions.map((action) => (
            <button key={action.name}
                className="btn"
                onClick={() => action.action(this.props.selectedItems) && this.props.selectNone()}
            >{action.name}</button>
        ));
        return (
            <div className="navbar">
                <div className="navbar-text">
                    {gettext('{{ count }} item(s) selected', {count: this.props.selectedItems.length})}
                    {' '}
                    <button className="btn btn-link" onClick={this.props.selectAll}>{gettext('Select All')}</button>
                    {' / '}
                    <button className="btn btn-link" onClick={this.props.selectNone}>{gettext('Cancel')}</button>
                </div>
                <div className="form-inline">
                    <div className="btn-group">
                        {actionButtons}
                    </div>
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
