import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {isEqual} from 'lodash';


import {gettext, isDisplayed} from 'utils';
import WireListItem from './WireListItem';
import { setActive, previewItem, toggleSelected, openItem } from '../actions';
import { EXTENDED_VIEW } from '../defaults';
import { getIntVersion } from '../utils';
import {searchNavigationSelector} from 'search/selectors';
import {previewConfigSelector} from 'ui/selectors';
import {getContextName} from 'selectors';

const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb
const CLICK_TIMEOUT = 200; // time when we wait for double click after click

class ItemsList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {actioningItem: null};

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
        this.onItemDoubleClick = this.onItemDoubleClick.bind(this);
        this.onActionList = this.onActionList.bind(this);
        this.filterActions = this.filterActions.bind(this);
    }

    onKeyDown(event) {
        let diff = 0;
        switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            diff = 1;
            break;

        case 'ArrowUp':
        case 'ArrowLeft':
            diff = -1;
            break;

        case 'Escape':
            this.setState({actioningItem: null});
            this.props.dispatch(setActive(null));
            this.props.dispatch(previewItem(null));
            return;

        default:
            return;
        }

        event.preventDefault();
        const activeIndex = this.props.activeItem ? this.props.items.indexOf(this.props.activeItem) : -1;

        // keep it within <0, items.length) interval
        const nextIndex = Math.max(0, Math.min(activeIndex + diff, this.props.items.length - 1));
        const nextItemId = this.props.items[nextIndex];
        const nextItem = this.props.itemsById[nextItemId];

        this.props.dispatch(setActive(nextItemId));

        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        this.previewTimeout = setTimeout(() => this.props.dispatch(previewItem(nextItem)), PREVIEW_TIMEOUT);

        const activeElements = document.getElementsByClassName('wire-articles__item--open');

        if (activeElements && activeElements.length) {
            activeElements[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
        }
    }

    cancelPreviewTimeout() {
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = null;
        }
    }

    cancelClickTimeout() {
        if (this.clickTimeout) {
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        }
    }

    onItemClick(item) {
        const itemId = item._id;
        this.setState({actioningItem: null});
        this.cancelPreviewTimeout();
        this.cancelClickTimeout();

        this.clickTimeout = setTimeout(() => {
            this.props.dispatch(setActive(itemId));

            if (this.props.previewItem !== itemId) {
                this.props.dispatch(previewItem(item));
            } else {
                this.props.dispatch(previewItem(null));
            }
        }, CLICK_TIMEOUT);
    }

    onItemDoubleClick(item) {
        this.cancelClickTimeout();
        this.props.dispatch(setActive(item._id));
        this.props.dispatch(openItem(item));
    }

    onActionList(event, item) {
        event.stopPropagation();
        if (this.state.actioningItem && this.state.actioningItem._id === item._id) {
            this.setState({actioningItem: null});
        } else {
            this.setState({actioningItem: item});
        }
    }

    filterActions(item, config) {
        return this.props.actions.filter((action) =>  (!config || isDisplayed(action.id, config)) &&
          (!action.when || action.when(this.props, item)));
    }

    componentDidUpdate(nextProps) {
        if (!isEqual(nextProps.activeNavigation, this.props.activeNavigation) ||
            (!nextProps.searchInitiated && this.props.searchInitiated)) {
            this.elem.scrollTop = 0;
        }
    }

    render() {
        const {items, itemsById, activeItem, activeView, selectedItems, readItems} = this.props;
        const isExtended = activeView === EXTENDED_VIEW;

        const articles = items.map((_id) =>
            <WireListItem
                key={_id}
                item={itemsById[_id]}
                isActive={activeItem === _id}
                isSelected={selectedItems.indexOf(_id) !== -1}
                isRead={readItems[_id] === getIntVersion(itemsById[_id])}
                onClick={this.onItemClick}
                onDoubleClick={this.onItemDoubleClick}
                onActionList={this.onActionList}
                showActions={!!this.state.actioningItem && this.state.actioningItem._id === _id}
                toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
                actions={this.filterActions(itemsById[_id], this.props.previewConfig)}
                isExtended={isExtended}
                user={this.props.user}
                context={this.props.context}
                contextName={this.props.contextName}
            />
        );

        const listClassName = classNames('wire-articles wire-articles--list', {
            'wire-articles--list-compact': !isExtended,
        });

        return (
            <div className={listClassName} onKeyDown={this.onKeyDown} ref={(elem) => this.elem = elem}>
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
    previewItem: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    selectedItems: PropTypes.array,
    readItems: PropTypes.object,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    bookmarks: PropTypes.bool,
    user: PropTypes.string,
    userType: PropTypes.string,
    company: PropTypes.string,
    activeView: PropTypes.string,
    context: PropTypes.string,
    searchInitiated: PropTypes.bool,
    activeNavigation: PropTypes.arrayOf(PropTypes.string),
    resultsFiltered: PropTypes.bool,
    isLoading: PropTypes.bool,
    previewConfig: PropTypes.object,
    contextName: PropTypes.string,
};

const mapStateToProps = (state) => ({
    items: state.items,
    itemsById: state.itemsById,
    activeItem: state.activeItem,
    previewItem: state.previewItem,
    selectedItems: state.selectedItems,
    readItems: state.readItems,
    bookmarks: state.bookmarks,
    user: state.user,
    userType: state.userType,
    company: state.company,
    context: state.context,
    searchInitiated: state.searchInitiated,
    activeNavigation: searchNavigationSelector(state),
    resultsFiltered: state.resultsFiltered,
    isLoading: state.isLoading,
    previewConfig: previewConfigSelector(state),
    contextName: getContextName(state),
});

export default connect(mapStateToProps)(ItemsList);
