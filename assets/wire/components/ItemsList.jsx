import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { gettext } from 'utils';
import WireListItem from './WireListItem';
import { setActive, previewItem, toggleSelected } from '../actions';

const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb

class ItemsList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {actioningItem: null};

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
        this.onActionList = this.onActionList.bind(this);
        this.filterActions = this.filterActions.bind(this);
    }

    onKeyDown(event) {
        let diff = 0;
        switch (event.key) {
        case 'ArrowDown':
            diff = 1;
            break;

        case 'ArrowUp':
            diff = -1;
            break;

        default:
            return;
        }

        event.preventDefault();
        const activeIndex = this.props.activeItem ? this.props.items.indexOf(this.props.activeItem) : -1;

        // keep it within <0, items.length) interval
        const nextIndex = Math.max(0, Math.min(activeIndex + diff, this.props.items.length - 1));
        const nextItem = this.props.items[nextIndex];

        this.props.dispatch(setActive(nextItem));

        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        this.previewTimeout = setTimeout(() => this.props.dispatch(previewItem(nextItem)), PREVIEW_TIMEOUT);
    }

    cancelPreviewTimeout() {
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = null;
        }
    }

    onItemClick(item) {
        this.cancelPreviewTimeout();
        this.props.dispatch(setActive(item));
        this.props.dispatch(previewItem(item));
    }

    onActionList(event, item) {
        event.stopPropagation();
        if (this.state.actioningItem && this.state.actioningItem._id === item._id) {
            this.setState({actioningItem: null});
        } else {
            this.setState({actioningItem: item});
        }
    }

    filterActions() {
        return this.props.actions.filter((action) => !action.when || action.when(this.props));
    }

    render() {
        const {items, itemsById, activeItem} = this.props;
        const filteredActions = this.filterActions();
        const articles = items.map((_id) =>
            <WireListItem
                key={_id}
                item={itemsById[_id]}
                isActive={activeItem === _id}
                isSelected={this.props.selectedItems.indexOf(_id) !== -1}
                onClick={this.onItemClick}
                onActionList={this.onActionList}
                showActions={!!this.state.actioningItem && this.state.actioningItem._id === _id}
                toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
                actions={filteredActions}
                activeView={this.props.activeView}
            />
        );

        return (
            <div className="wire-articles wire-articles--list row" onKeyDown={this.onKeyDown}>
                {articles}
                {!articles.length &&
                    <div className="wire-articles__item-wrap col-12">
                        <div className="alert alert-secondary">{gettext('No items found.')}</div>
                    </div>
                }
            </div>
        );
    }
}

ItemsList.propTypes = {
    items: PropTypes.array.isRequired,
    itemsById: PropTypes.object,
    activeItem: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    selectedItems: PropTypes.array,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    bookmarks: PropTypes.bool,
    user: PropTypes.string,
    company: PropTypes.string,
    activeView: PropTypes.string,
};

const mapStateToProps = (state) => ({
    items: state.items,
    itemsById: state.itemsById,
    activeItem: state.activeItem,
    selectedItems: state.selectedItems,
    bookmarks: state.bookmarks,
    user: state.user,
    company: state.company,
});

export default connect(mapStateToProps)(ItemsList);
