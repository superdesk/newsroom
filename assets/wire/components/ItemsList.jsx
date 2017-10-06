import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import WireListItem from './WireListItem';
import { setActive, previewItem, toggleSelected } from '../actions';

const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb

class ItemsList extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
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

    render() {
        const {items, itemsById, activeItem} = this.props;
        const articles = items.map((_id) =>
            <WireListItem
                key={_id}
                item={itemsById[_id]}
                isActive={activeItem === _id}
                isSelected={this.props.selectedItems.indexOf(_id) !== -1}
                onClick={this.onItemClick}
                toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
            />
        );

        return (
            <div className="col" onKeyDown={this.onKeyDown}>
                {articles}
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
};

const mapStateToProps = (state) => ({
    items: state.items,
    itemsById: state.itemsById,
    activeItem: state.activeItem,
    selectedItems: state.selectedItems,
});

export default connect(mapStateToProps)(ItemsList);
