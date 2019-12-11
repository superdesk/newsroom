import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { groupBy } from 'lodash';
import moment from 'moment/moment';

import {gettext, formatDate, DATE_FORMAT} from 'utils';
import AmNewsListItem from './AmNewsListItem';
import {setActive, previewItem, toggleSelected, openItem} from '../../wire/actions';
import {getIntVersion} from '../../wire/utils';
import {getContextName} from 'selectors';

const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb
const CLICK_TIMEOUT = 200; // time when we wait for double click after click

const itemsSelector = (state) => state.items.map((_id) => state.itemsById[_id]);
const groupedItemsSelector = createSelector(
    [itemsSelector],
    (items) => {
        const groupByDate = (item) => {
            const date =  moment(item.versioncreated).set({'h': 0, 'm': 0, 's': 0});
            return formatDate(date);
        };

        const groupedItems = groupBy(items, groupByDate);

        return groupedItems;
    }
);


class AmNewsList extends React.Component {
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

    filterActions(item) {
        return this.props.actions.filter((action) => !action.when || action.when(this.props, item));
    }

    render() {
        const {activeItem, selectedItems, readItems, groupedItems} = this.props;
        const todayMoment = moment();
        const today = formatDate(todayMoment);

        const groups = Object.keys(groupedItems).map((keyDate) => {
            const groupItem = [];

            if(today !== keyDate) {
                const keyDateMoment = moment(keyDate, DATE_FORMAT);
                groupItem.push(
                    <div className='wire-articles__header' key={`${keyDate}header`}>
                        {keyDateMoment.format(keyDateMoment.year() === todayMoment.year() ? 'dddd, MMMM D' : 'dddd, MMMM D, YYYY')}
                    </div>
                );
            }

            groupItem.push(
                <div className = 'wire-articles__group' key={`${keyDate}group`}>
                    {
                        groupedItems[keyDate].map((item) =>
                            <AmNewsListItem
                                key={item._id}
                                item={item}
                                isActive={activeItem === item._id}
                                isSelected={selectedItems.indexOf(item._id) !== -1}
                                isRead={readItems[item._id] === getIntVersion(item)}
                                onClick={this.onItemClick}
                                onDoubleClick={this.onItemDoubleClick}
                                onActionList={this.onActionList}
                                showActions={!!this.state.actioningItem && this.state.actioningItem._id === item._id}
                                toggleSelected={() => this.props.dispatch(toggleSelected(item._id))}
                                actions={this.filterActions(item)}
                                user={this.props.user}
                                contextName={this.props.contextName}
                            />)
                    }

                </div>
            );

            return groupItem;
        });

        return (
            <div className="wire-articles wire-articles--list" onKeyDown={this.onKeyDown} onScroll={this.props.onScroll}
                ref={this.props.refNode} >
                {groups}
                {!groups.length &&
                    <div className="wire-articles__item-wrap col-12">
                        <div className="alert alert-secondary">{gettext('No items found.')}</div>
                    </div>
                }
            </div>
        );
    }
}

AmNewsList.propTypes = {
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
    groupedItems: PropTypes.object,
    refNode: PropTypes.func,
    onScroll: PropTypes.func,
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
    groupedItems: groupedItemsSelector(state),
    contextName: getContextName(state),
});

export default connect(mapStateToProps)(AmNewsList);
