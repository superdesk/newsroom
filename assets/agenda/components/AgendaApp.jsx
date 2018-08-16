import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { gettext } from 'utils';

import {
    followEvent,
    fetchItems,
    selectDate,
    fetchMoreItems,
    refresh,
    previewItem,
    toggleDropdownFilter,
    openItemDetails,
    requestCoverage,
} from 'agenda/actions';

import {
    setView,
} from 'search/actions';

import BaseApp from 'layout/components/BaseApp';
import AgendaPreview from './AgendaPreview';
import AgendaList from './AgendaList';
import SearchBar from 'components/SearchBar';
import SearchSidebar from 'wire/components/SearchSidebar';
import SelectedItemsBar from 'wire/components/SelectedItemsBar';
import AgendaListViewControls from './AgendaListViewControls';
import DownloadItemsModal from 'wire/components/DownloadItemsModal';
import AgendaItemDetails from 'agenda/components/AgendaItemDetails';

import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import { getItemActions } from 'wire/item-actions';
import AgendaFilters from './AgendaFilters';
import AgendaDateNavigation from './AgendaDateNavigation';
import BookmarkTabs from 'components/BookmarkTabs';

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
    }

    render() {
        const modal = this.renderModal(this.props.modal);

        const isFollowing = get(this.props, 'itemToPreview._id') && this.props.topics &&
            this.props.topics.find((topic) => topic.query === this.props.itemToPreview._id);
        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        const mainClassName = classNames('wire-column__main', {
            'wire-articles__one-side-pane': panesCount === 1,
            'wire-articles__two-side-panes': panesCount === 2,
        });

        const activeTopic = this.props.topics.find((topic) => topic._id === this.props.activeTopic);
        const onDetailClose = this.props.detail ? null : () => this.props.actions.filter(a => a.id == 'open')[0].action(null);

        return (
            (this.props.itemToOpen ? [<AgendaItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={onDetailClose}
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
                            <BookmarkTabs active="agenda" />
                        }

                        <SearchBar
                            fetchItems={this.props.fetchItems}
                        />

                        <AgendaDateNavigation
                            selectDate={this.props.selectDate}
                            activeDate={this.props.activeDate}
                            activeGrouping={this.props.activeGrouping}
                            displayCalendar={true}
                        />

                        <AgendaListViewControls
                            activeView={this.props.activeView}
                            setView={this.props.setView}
                            activeNavigation={this.props.activeNavigation}
                        />
                    </nav>
                </section>,
                <section key="contentMain" className='content-main'>
                    <div className='wire-column--3'>
                        <div className={`wire-column__nav ${this.state.withSidebar?'wire-column__nav--open':''}`}>
                            {this.state.withSidebar &&
                                <SearchSidebar tabs={this.tabs} props={this.props} />
                            }
                        </div>
                        <div className={mainClassName} onScroll={this.onListScroll} ref={(elem) => this.elemList = elem}>
                            {!this.props.bookmarks &&
                                <AgendaFilters
                                    aggregations={this.props.aggregations}
                                    toggleFilter={this.props.toggleDropdownFilter}
                                    activeFilter={this.props.activeFilter}
                                />
                            }

                            <AgendaList
                                actions={this.props.actions}
                                activeView={this.props.activeView}
                            />
                        </div>

                        <AgendaPreview
                            item={this.props.itemToPreview}
                            user={this.props.user}
                            actions={this.filterActions(this.props.itemToPreview)}
                            followEvent={this.props.followEvent}
                            isFollowing={!!isFollowing}
                            closePreview={this.props.closePreview}
                            openItemDetails={this.props.openItemDetails}
                            requestCoverage={this.props.requestCoverage}
                        />
                    </div>
                </section>
            ]).concat([
                modal,
                this.renderNavBreadcrumb(
                    this.props.navigations,
                    this.props.activeNavigation,
                    activeTopic
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
    itemToOpen: PropTypes.object,
    itemsById: PropTypes.object,
    followEvent: PropTypes.func,
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
    refresh: PropTypes.func,
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    resultsFiltered: PropTypes.bool,
    aggregations: PropTypes.object,
    toggleDropdownFilter: PropTypes.func,
    selectDate: PropTypes.func,
    activeDate: PropTypes.number,
    activeGrouping: PropTypes.string,
    activeTopic: PropTypes.string,
    openItemDetails: PropTypes.func,
    requestCoverage: PropTypes.func,
    detail: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    state: state,
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    activeFilter: get(state, 'search.activeFilter'),
    createdFilter: get(state, 'search.createdFilter'),
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    itemToOpen: state.openItem ? state.itemsById[state.openItem._id] : null,
    itemsById: state.itemsById,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics || [],
    activeView: get(state, 'search.activeView'),
    newItems: state.newItems,
    navigations: get(state, 'search.navigations', []),
    activeTopic: get(state, 'search.activeTopic'),
    activeNavigation: get(state, 'search.activeNavigation', null),
    bookmarks: state.bookmarks,
    resultsFiltered: state.resultsFiltered,
    aggregations: state.aggregations,
    activeDate: get(state, 'agenda.activeDate'),
    activeGrouping: get(state, 'agenda.activeGrouping'),
    detail: get(state, 'detail', false),
});

const mapDispatchToProps = (dispatch) => ({
    followEvent: (item) => dispatch(followEvent({
        label: item.name,
        query: `${item._id}`
    })),
    fetchItems: () => dispatch(fetchItems()),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    setView: (view) => dispatch(setView(view)),
    refresh: () => dispatch(refresh()),
    closePreview: () => dispatch(previewItem(null)),
    toggleDropdownFilter: (field, value) => dispatch(toggleDropdownFilter(field, value)),
    selectDate: (dateString, grouping) => {
        dispatch(selectDate(dateString, grouping));
        dispatch(fetchItems());
    },
    openItemDetails: (item) => dispatch(openItemDetails(item)),
    requestCoverage: (item, message) => dispatch(requestCoverage(item, message)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AgendaApp);
