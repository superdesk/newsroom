import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { gettext } from 'utils';

import {
    fetchItems,
    selectDate,
    fetchMoreItems,
    previewItem,
    toggleDropdownFilter,
    openItemDetails,
    requestCoverage,
    toggleFeaturedFilter,
} from 'agenda/actions';

import {
    setView,
} from 'search/actions';

import {
    activeTopicSelector,
} from 'search/selectors';

import BaseApp from 'layout/components/BaseApp';
import AgendaPreview from './AgendaPreview';
import AgendaList from './AgendaList';
import SearchBar from 'components/SearchBar';
import SearchSidebar from 'wire/components/SearchSidebar';
import SelectedItemsBar from 'wire/components/SelectedItemsBar';
import AgendaListViewControls from './AgendaListViewControls';
import DownloadItemsModal from 'wire/components/DownloadItemsModal';
import AgendaItemDetails from 'agenda/components/AgendaItemDetails';
import SearchResultsInfo from 'wire/components/SearchResultsInfo';

import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import getItemActions from '../item-actions';
import AgendaFilters from './AgendaFilters';
import AgendaDateNavigation from './AgendaDateNavigation';
import BookmarkTabs from 'components/BookmarkTabs';
import {setActiveDate, setAgendaDropdownFilter} from 'local-store';

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class AgendaApp extends BaseApp {
    constructor(props) {
        super(props);
        this.modals = modals;
        this.tabs[0].label = gettext('Events');
        this.tabs[1].label = gettext('My Events');

        this.fetchItemsOnNavigation = this.fetchItemsOnNavigation.bind(this);
    }

    getTabs() {
        return this.props.featuredOnly ?  this.tabs.filter((t) => t.id !== 'filters') : this.tabs;
    }


    fetchItemsOnNavigation() {
        // Toggle featured filter to 'false'
        if (this.props.featuredOnly) {
            this.props.toggleFeaturedFilter(false);
        }


        this.props.fetchItems();

    }

    render() {
        const modal = this.renderModal(this.props.modal);
        const showDatePicker = isEmpty(this.props.createdFilter.from) && isEmpty(this.props.createdFilter.to) && !this.props.bookmarks;

        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        const mainClassName = classNames('wire-column__main', {
            'wire-articles__one-side-pane': panesCount === 1,
            'wire-articles__two-side-panes': panesCount === 2,
        });

        const onDetailClose = this.props.detail ? null :
            () => this.props.actions.filter(a => a.id == 'open')[0].action(null, this.props.previewGroup, this.props.previewPlan);

        const groups = [
            {
                field: 'service',
                label: gettext('Category'),
            },
            {
                field: 'subject',
                label: gettext('Subject'),
            },
            {
                field: 'urgency',
                label: gettext('News Value'),
            },
            {
                field: 'place',
                label: gettext('Place'),
            },
        ];

        return (
            (this.props.itemToOpen ? [<AgendaItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={onDetailClose}
                requestCoverage={this.props.requestCoverage}
                group={this.props.previewGroup}
                planningId={this.props.previewPlan}
                eventsOnly={this.props.eventsOnly}
            />] : [
                <section key="contentHeader" className='content-header'>
                    <SelectedItemsBar
                        actions={this.props.actions}
                    />
                    <nav className='content-bar navbar justify-content-start flex-nowrap flex-sm-wrap'>
                        {this.state.withSidebar && <span
                            className='content-bar__menu content-bar__menu--nav--open'
                            ref={(elem) => this.elemOpen = elem}
                            title={gettext('Close filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className='icon--close-thin icon--white'></i>
                        </span>}
                        {!this.state.withSidebar && !this.props.bookmarks && <span
                            className='content-bar__menu content-bar__menu--nav'
                            ref={(elem) => this.elemClose = elem}
                            title={gettext('Open filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className='icon--hamburger'></i>
                        </span>}

                        {this.props.bookmarks &&
                            <BookmarkTabs active="agenda" sections={this.props.userSections}/>
                        }

                        <SearchBar
                            fetchItems={this.props.fetchItems}
                        />

                        {showDatePicker && <AgendaDateNavigation
                            selectDate={this.props.selectDate}
                            activeDate={this.props.activeDate}
                            createdFilter={this.props.createdFilter}
                            activeGrouping={this.props.activeGrouping}
                            displayCalendar={true}
                        />}

                        <AgendaListViewControls
                            activeView={this.props.activeView}
                            setView={this.props.setView}
                            hideFeaturedToggle={this.props.activeNavigation || this.props.bookmarks || this.props.activeTopic}
                            toggleFeaturedFilter={this.props.toggleFeaturedFilter}
                            featuredFilter={this.props.featuredOnly}
                        />
                    </nav>
                </section>,
                <section key="contentMain" className='content-main'>
                    <div className='wire-column--3'>
                        <div className={`wire-column__nav ${this.state.withSidebar?'wire-column__nav--open':''}`}>
                            {this.state.withSidebar &&
                                <SearchSidebar
                                    tabs={this.getTabs()}
                                    props={{ 
                                        ...this.props,
                                        groups,
                                        fetchItems: this.fetchItemsOnNavigation }} />
                            }
                        </div>
                        <div className={mainClassName}>
                            {!this.props.bookmarks &&
                                <AgendaFilters
                                    aggregations={this.props.aggregations}
                                    toggleFilter={this.props.toggleDropdownFilter}
                                    activeFilter={this.props.activeFilter}
                                    eventsOnly={this.props.eventsOnly}
                                />
                            }

                            <SearchResultsInfo
                                user={this.props.user}
                                query={this.props.activeQuery}
                                bookmarks={this.props.bookmarks}
                                totalItems={this.props.totalItems}
                                topicType='agenda'
                                newItems={this.props.newItems}
                                refresh={this.props.fetchItems}
                                activeTopic={this.props.activeTopic}
                                toggleNews={this.props.toggleNews}
                                activeNavigation={this.props.activeNavigation}
                                newsOnly={this.props.newsOnly}
                                scrollClass={this.state.scrollClass}
                                hideTotalItems={false}
                                featuredOnly={this.props.featuredOnly}
                            />

                            <AgendaList
                                actions={this.props.actions}
                                activeView={this.props.activeView}
                                onScroll={this.onListScroll}
                                refNode={(node) => this.elemList = node}
                            />
                        </div>

                        <AgendaPreview
                            item={this.props.itemToPreview}
                            user={this.props.user}
                            actions={this.filterActions(this.props.itemToPreview)}
                            closePreview={this.props.closePreview}
                            openItemDetails={this.props.openItemDetails}
                            requestCoverage={this.props.requestCoverage}
                            previewGroup={this.props.previewGroup}
                            previewPlan={this.props.previewPlan}
                            eventsOnly={this.props.eventsOnly}
                        />
                    </div>
                </section>
            ]).concat([
                modal,
                this.renderNavBreadcrumb(
                    this.props.navigations,
                    this.props.activeNavigation,
                    this.props.activeTopic
                )
            ])
        );
    }
}

AgendaApp.propTypes = {
    state: PropTypes.object,
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object,
    itemToPreview: PropTypes.object,
    previewGroup: PropTypes.string,
    previewPlan: PropTypes.string,
    itemToOpen: PropTypes.object,
    itemsById: PropTypes.object,
    modal: PropTypes.object,
    user: PropTypes.string,
    company: PropTypes.string,
    topics: PropTypes.array,
    fetchItems: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    bookmarks: PropTypes.bool,
    fetchMoreItems: PropTypes.func,
    activeView: PropTypes.string,
    setView: PropTypes.func,
    newItems: PropTypes.array,
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    aggregations: PropTypes.object,
    toggleDropdownFilter: PropTypes.func,
    selectDate: PropTypes.func,
    activeDate: PropTypes.number,
    activeGrouping: PropTypes.string,
    activeTopic: PropTypes.object,
    openItemDetails: PropTypes.func,
    requestCoverage: PropTypes.func,
    detail: PropTypes.bool,
    savedItemsCount: PropTypes.number,
    userSections: PropTypes.object,
    eventsOnly: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    state: state,
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    activeFilter: get(state, 'search.activeFilter'),
    createdFilter: get(state, 'search.createdFilter'),
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    previewGroup: state.previewGroup,
    previewPlan: state.previewPlan,
    itemToOpen: state.openItem ? state.itemsById[state.openItem._id] : null,
    itemsById: state.itemsById,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics || [],
    activeView: get(state, 'search.activeView'),
    newItems: state.newItems,
    navigations: get(state, 'search.navigations', []),
    activeTopic: activeTopicSelector(state),
    activeNavigation: get(state, 'search.activeNavigation', null),
    bookmarks: state.bookmarks,
    aggregations: state.aggregations,
    activeDate: get(state, 'agenda.activeDate'),
    activeGrouping: get(state, 'agenda.activeGrouping'),
    eventsOnly: get(state, 'agenda.eventsOnly', false),
    detail: get(state, 'detail', false),
    savedItemsCount: state.savedItemsCount,
    userSections: state.userSections,
    featuredOnly: get(state, 'agenda.featuredOnly'),
});

const mapDispatchToProps = (dispatch) => ({
    fetchItems: () => dispatch(fetchItems()),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    setView: (view) => dispatch(setView(view)),
    closePreview: () => dispatch(previewItem(null)),
    toggleDropdownFilter: (field, value) => {
        setAgendaDropdownFilter(field, value);
        dispatch(toggleDropdownFilter(field, value));
    },
    selectDate: (dateString, grouping) => {
        dispatch(selectDate(dateString, grouping));
        setActiveDate(dateString);
        dispatch(fetchItems());
    },
    openItemDetails: (item) => dispatch(openItemDetails(item)),
    requestCoverage: (item, message) => dispatch(requestCoverage(item, message)),
    toggleFeaturedFilter: (fetch) => dispatch(toggleFeaturedFilter(fetch)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AgendaApp);
