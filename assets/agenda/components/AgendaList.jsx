import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import classNames from 'classnames';
import moment from 'moment/moment';

import { gettext, formatDate, formatWeek, formatMonth } from 'utils';
import AgendaListItem from './AgendaListItem';
import { setActive, previewItem, toggleSelected, openItem } from '../actions';
import { EXTENDED_VIEW } from 'wire/defaults';
import { getIntVersion } from 'wire/utils';

const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb
const CLICK_TIMEOUT = 200; // time when we wait for double click after click

const Groupers = {
    'day': formatDate,
    'week': formatWeek,
    'month': formatMonth,
};

const itemsSelector = (state) => state.items.map((_id) => state.itemsById[_id]);
const activeDateSelector = (state) => get(state, 'agenda.activeDate');
const activeGroupingSelector = (state) => get(state, 'agenda.activeGrouping');

const timeComparer = (item1, item2) => moment(item1.dates.start, 'HH:mm').isBefore(moment(item2.dates.start, 'HH:mm')) ? -1 : 1;

const sortGroupedItems = (groupedItems) => {
    // sorts items in every group by their start times

    Object.keys(groupedItems).map((key) => {
        groupedItems[key] = groupedItems[key].sort(timeComparer).map(i => i._id);
    });

    return groupedItems;
};

const groupedItemsSelector = createSelector(
    [itemsSelector, activeDateSelector, activeGroupingSelector],
    (items, activeDate, activeGrouping) => {
        const maxStart = moment(activeDate).set({'h': 0, 'm': 0, 's': 0});
        const groupedItems = {};
        const grouper = Groupers[activeGrouping];

        items.forEach((item) => {
            const start = item._display_from ? moment(item._display_from) : moment.max(maxStart, moment(item.dates.start));
            const end = item._display_to ? moment(item._display_to) : moment(get(item, 'dates.end', start));
            let key = null;

            // use clone otherwise it would modify start and potentially also maxStart, moments are mutable
            for (const day = start.clone(); day.isSameOrBefore(end); day.add(1, 'd')) {
                if (grouper(day) !== key) {
                    key = grouper(day);
                    const groupList = groupedItems[key] || [];
                    groupList.push(item);
                    groupedItems[key] = groupList;
                }
            }
        });

        return sortGroupedItems(groupedItems);
    }
);

class AgendaList extends React.Component {
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
            diff = 1;
            break;

        case 'ArrowUp':
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

    onActionList(event, item, group) {
        event.stopPropagation();
        if (this.state.actioningItem && this.state.actioningItem._id === item._id) {
            this.setState({actioningItem: null});
        } else {
            this.setState({actioningItem: item, activeGroup: group});
        }
    }

    filterActions(item) {
        return this.props.actions.filter((action) => !action.when || action.when(this.props, item));
    }

    render() {
        const {items, itemsById, activeItem, activeView, selectedItems, readItems} = this.props;
        const isExtended = activeView === EXTENDED_VIEW;
        const articleGroups = Object.keys(this.props.groupedItems).map((keyDate) =>
            [
                <div className='wire-articles__header' key={`${keyDate}header`}>
                    {keyDate}
                </div>,

                <div className = 'wire-articles__group' key={`${keyDate}group`}>
                    {this.props.groupedItems[keyDate].map((_id) => <AgendaListItem
                        key={_id}
                        group={keyDate}
                        item={itemsById[_id]}
                        isActive={activeItem === _id}
                        isSelected={selectedItems.indexOf(_id) !== -1}
                        isRead={readItems[_id] === getIntVersion(itemsById[_id])}
                        onClick={this.onItemClick}
                        onDoubleClick={this.onItemDoubleClick}
                        onActionList={this.onActionList}
                        showActions={!!this.state.actioningItem && this.state.actioningItem._id === _id && keyDate === this.state.activeGroup}
                        toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
                        actions={this.filterActions(itemsById[_id])}
                        isExtended={isExtended}
                        user={this.props.user}
                    />)}
                </div>
            ]
        );


        const listClassName = classNames('wire-articles wire-articles--list', {
            'wire-articles--list-compact': !isExtended,
        });

        return (
            <div className={listClassName} onKeyDown={this.onKeyDown}>
                {articleGroups}
                {!items.length &&
                    <div className="wire-articles__item-wrap col-12">
                        <div className="alert alert-secondary">{gettext('No items found.')}</div>
                    </div>
                }
            </div>
        );
    }
}

AgendaList.propTypes = {
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
    company: PropTypes.string,
    activeView: PropTypes.string,
    groupedItems: PropTypes.object,
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
    company: state.company,
    groupedItems: groupedItemsSelector(state),
});

export default connect(mapStateToProps)(AgendaList);
