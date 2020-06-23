import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {get, isEqual, cloneDeep} from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import {gettext, DATE_FORMAT, isDisplayed} from 'utils';
import AgendaListItem from './AgendaListItem';
import { setActive, previewItem, toggleSelected, openItem } from '../actions';
import { EXTENDED_VIEW } from 'wire/defaults';
import { getIntVersion } from 'wire/utils';
import { groupItems, getPlanningItemsByGroup, getListItems } from 'agenda/utils';
import {searchNavigationSelector} from 'search/selectors';
import {previewConfigSelector} from 'ui/selectors';


const PREVIEW_TIMEOUT = 500; // time to preview an item after selecting using kb
const CLICK_TIMEOUT = 200; // time when we wait for double click after click


const itemsSelector = (state) => state.items.map((_id) => state.itemsById[_id]);
const activeDateSelector = (state) => get(state, 'agenda.activeDate');
const activeGroupingSelector = (state) => get(state, 'agenda.activeGrouping');
const itemsByIdSelector = (state) => get(state, 'itemsById', {});
const featuredOnlySelector = (state) => get(state, 'agenda.featuredOnly', false);

const groupedItemsSelector = createSelector(
    [itemsSelector, activeDateSelector, activeGroupingSelector, featuredOnlySelector],
    groupItems);

/**
 * Single event or planning item could be display multiple times.
 * Hence, the list items needs to tbe calculate so that keyboard scroll works.
 * This selector calculates list of items.
 */
const listItemsSelector = createSelector(
    [groupedItemsSelector, itemsByIdSelector],
    getListItems
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
        this.resetActioningItem = this.resetActioningItem.bind(this);
        this.isActiveItem = this.isActiveItem.bind(this);
    }

    onKeyDown(event) {
        let diff = 0;
        switch (event.key) {
        case 'ArrowDown':
            this.setState({actioningItem: null});
            diff = 1;
            break;

        case 'ArrowUp':
            this.setState({actioningItem: null});
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
        const activeItem = this.props.activeItem;

        const activeIndex = this.props.activeItem ? this.props.listItems.findIndex((item) => {
            return item._id === activeItem._id &&
                item.group === activeItem.group &&
                get(item, 'plan._id') === get(activeItem, 'plan._id');
        }) : -1;

        // keep it within <0, items.length) interval
        const nextIndex = Math.max(0, Math.min(activeIndex + diff, this.props.listItems.length - 1));
        const nextItemInList = this.props.listItems[nextIndex];
        const nextItem = this.props.itemsById[nextItemInList._id];

        this.props.dispatch(setActive(nextItemInList));

        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        this.previewTimeout = setTimeout(() => this.props.dispatch(
            previewItem(nextItem, nextItemInList.group, nextItemInList.plan)
        ), PREVIEW_TIMEOUT);

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

    onItemClick(item, group, plan) {
        const itemId = item._id;
        this.setState({actioningItem: null});
        this.cancelPreviewTimeout();
        this.cancelClickTimeout();

        this.clickTimeout = setTimeout(() => {
            this.props.dispatch(setActive({_id: itemId, group: group, plan: plan}));

            if (this.props.previewItem !== itemId ||
                this.props.previewGroup !== group ||
                this.props.previewPlan !== plan) {
                this.props.dispatch(previewItem(item, group, plan));
            } else {
                this.props.dispatch(previewItem(null, null, null));
            }
        }, CLICK_TIMEOUT);
    }

    resetActioningItem() {
        this.setState({actioningItem: null});
    }

    onItemDoubleClick(item, group, plan) {
        this.cancelClickTimeout();
        this.props.dispatch(setActive({_id: item._id, group: group, plan: plan}));
        this.props.dispatch(openItem(item, group, plan));
    }

    onActionList(event, item, group, plan) {
        event.stopPropagation();
        if (this.state.actioningItem && this.state.actioningItem._id === item._id &&
            (!this.state.activePlan || (this.state.activePlan && this.state.activePlan.guid === get(plan, 'guid')))) {
            this.setState({actioningItem: null, activeGroup: null, activePlan: null});
        } else {
            this.setState({actioningItem: item, activeGroup: group, activePlan: plan});
        }
    }

    filterActions(item, config) {
        return this.props.actions.filter((action) =>  (!config || isDisplayed(action.id, config)) &&
          (!action.when || action.when(this.props, item)));
    }

    isActiveItem(_id, group, plan) {
        const { activeItem } = this.props;

        if (!activeItem || (!_id && !group && !plan)) {
            return false;
        }

        if (_id && group && plan) {
            return _id === activeItem._id && group === activeItem.group && plan.guid === get(activeItem, 'plan.guid');
        }

        if (_id && group) {
            return _id === activeItem._id && group === activeItem.group;
        }

        return _id === activeItem._id;
    }

    componentDidUpdate(nextProps) {
        if (!isEqual(nextProps.activeDate, this.props.activeDate) ||
          !isEqual(nextProps.activeNavigation, this.props.activeNavigation) ||
          (!nextProps.searchInitiated && this.props.searchInitiated)) {
            this.elem.scrollTop = 0;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.groupedItems) {
            return;
        }
    }

    getListGroupDate(group) {
        if (get(group, 'date')) {
            const groupDate = moment(group.date, DATE_FORMAT);
            const today = moment();
            const tomorrow  = moment(today).add(1,'days');
            if (groupDate.isSame(today, 'day')) {
                return gettext('Today');
            }

            if (groupDate.isSame(tomorrow, 'day')) {
                return gettext('Tomorrow');
            }

            return groupDate.format(groupDate.year() === today.year() ? 'dddd, MMMM D' : 'dddd, MMMM D, YYYY');
        }
    }

    render() {
        const {
            groupedItems,
            itemsById,
            activeView,
            selectedItems,
            readItems,
            refNode,
            onScroll,
        } = this.props;
        const isExtended = activeView === EXTENDED_VIEW;
        const articleGroups = groupedItems.map((group) =>
            [
                <div className='wire-articles__header' key={`${group.date}header`}>
                    {this.getListGroupDate(group)}
                </div>,

                <div className = 'wire-articles__group' key={`${group.date}group`}>
                    {group.items.map((_id, groupIndex) => {

                        const plans = getPlanningItemsByGroup(itemsById[_id], group.date);

                        if (plans.length > 0) {
                            return (<Fragment key={`${_id}--${groupIndex}`}>
                                {
                                    plans.map((plan) =>
                                        <AgendaListItem
                                            key={`${_id}--${plan._id}`}
                                            group={group.date}
                                            item={cloneDeep(itemsById[_id])}
                                            isActive={this.isActiveItem(_id, group.date, plan)}
                                            isSelected={selectedItems.indexOf(_id) !== -1}
                                            isRead={readItems[_id] === getIntVersion(itemsById[_id])}
                                            onClick={this.onItemClick}
                                            onDoubleClick={this.onItemDoubleClick}
                                            onActionList={this.onActionList}
                                            showActions={!!this.state.actioningItem &&
                                            this.state.actioningItem._id === _id &&
                                            group.date === this.state.activeGroup &&
                                            plan.guid === get(this.state.activePlan, 'guid')}
                                            toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
                                            actions={this.filterActions(itemsById[_id], this.props.previewConfig)}
                                            isExtended={isExtended}
                                            user={this.props.user}
                                            actioningItem={this.state.actioningItem}
                                            planningId={plan.guid}
                                            resetActioningItem={this.resetActioningItem}/>
                                    )
                                }
                            </Fragment>);
                        } else {
                            return (<AgendaListItem
                                key={_id}
                                group={group.date}
                                item={itemsById[_id]}
                                isActive={this.isActiveItem(_id, group.date, null)}
                                isSelected={selectedItems.indexOf(_id) !== -1}
                                isRead={readItems[_id] === getIntVersion(itemsById[_id])}
                                onClick={this.onItemClick}
                                onDoubleClick={this.onItemDoubleClick}
                                onActionList={this.onActionList}
                                showActions={!!this.state.actioningItem &&
                                this.state.actioningItem._id === _id && group.date === this.state.activeGroup}
                                toggleSelected={() => this.props.dispatch(toggleSelected(_id))}
                                actions={this.filterActions(itemsById[_id], this.props.previewConfig)}
                                isExtended={isExtended}
                                user={this.props.user}
                                actioningItem={this.state.actioningItem}
                                resetActioningItem={this.resetActioningItem}
                            />);
                        }
                    })}
                </div>
            ]
        );


        const listClassName = classNames('wire-articles wire-articles--list', {
            'wire-articles--list-compact': !isExtended,
        });

        return (
            <div className={listClassName}
                onKeyDown={this.onKeyDown}
                ref={(elem) => {
                    if (elem) {
                        refNode(elem);
                        this.elem = elem;
                    }
                }}
                onScroll={onScroll} >
                {articleGroups}
                {!groupedItems.length &&
                    <div className="wire-articles__item-wrap col-12">
                        <div className="alert alert-secondary">{gettext('No items found.')}</div>
                    </div>
                }
            </div>
        );
    }
}

AgendaList.propTypes = {
    itemsById: PropTypes.object,
    activeItem: PropTypes.object,
    previewItem: PropTypes.string,
    previewGroup: PropTypes.string,
    previewPlan: PropTypes.string,
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
    groupedItems: PropTypes.array,
    activeDate: PropTypes.number,
    searchInitiated: PropTypes.bool,
    activeNavigation: PropTypes.arrayOf(PropTypes.string),
    resultsFiltered: PropTypes.bool,
    listItems: PropTypes.array,
    isLoading: PropTypes.bool,
    onScroll: PropTypes.func,
    refNode: PropTypes.func,
    previewConfig: PropTypes.object,
    featuredOnly: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    itemsById: state.itemsById,
    activeItem: state.activeItem,
    previewItem: state.previewItem,
    previewGroup: state.previewGroup,
    previewPlan: state.previewPlan,
    selectedItems: state.selectedItems,
    readItems: state.readItems,
    bookmarks: state.bookmarks,
    user: state.user,
    company: state.company,
    groupedItems: groupedItemsSelector(state),
    activeDate: get(state, 'agenda.activeDate'),
    searchInitiated: state.searchInitiated,
    activeNavigation: searchNavigationSelector(state),
    resultsFiltered: state.resultsFiltered,
    listItems: listItemsSelector(state),
    isLoading: state.isLoading,
    previewConfig: previewConfigSelector(state),
    featuredOnly: get(state, 'agenda.featuredOnly'),
});

export default connect(mapStateToProps)(AgendaList);
