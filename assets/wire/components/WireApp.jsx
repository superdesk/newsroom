import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { gettext } from 'utils';

import {
    fetchItems,
    setQuery,
    fetchMoreItems,
    previewItem,
    toggleNews,
    downloadVideo,
} from 'wire/actions';

import {
    setView,
    followTopic,
} from 'search/actions';

import { activeTopicSelector } from 'search/selectors';

import BaseApp from 'layout/components/BaseApp';
import WirePreview from './WirePreview';
import ItemsList from './ItemsList';
import SearchBar from '../../components/SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';
import SelectedItemsBar from './SelectedItemsBar';
import ListViewControls from './ListViewControls';
import DownloadItemsModal from './DownloadItemsModal';
import ItemDetails from './ItemDetails';

import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import getItemActions from '../item-actions';
import BookmarkTabs from 'components/BookmarkTabs';

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class WireApp extends BaseApp {
    constructor(props) {
        super(props);
        this.modals = modals;

        // Show my-topics tab only if WireApp is in 'wire' context (not 'aapX', etc.)
        if (this.props.context !== 'wire') {
            this.tabs = this.tabs.filter((t) => t.id !== 'topics');
        }
    }

    render() {
        const modal = this.renderModal(this.props.modal);

        const isFollowing = get(this.props, 'itemToPreview.slugline') && this.props.topics &&
            this.props.topics.find((topic) => topic.query === `slugline:"${this.props.itemToPreview.slugline}"`);
        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        const mainClassName = classNames('wire-column__main', {
            'wire-articles__one-side-pane': panesCount === 1,
            'wire-articles__two-side-panes': panesCount === 2,
        });

        return (
            (this.props.itemToOpen ? [<ItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                detailsConfig={this.props.detailsConfig}
                downloadVideo={this.props.downloadVideo}
                onClose={() => this.props.actions.filter(a => a.id === 'open')[0].action(null)}
            />] : [
                <section key="contentHeader" className='content-header'>
                    <SelectedItemsBar
                        actions={this.props.actions}
                    />
                    <nav className="content-bar navbar justify-content-start flex-nowrap flex-sm-wrap">
                        {this.state.withSidebar && <span
                            className='content-bar__menu content-bar__menu--nav--open'
                            ref={(elem) => this.elemOpen = elem}
                            title={gettext('Close filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className="icon--close-thin icon--white" />
                        </span>}

                        {this.props.bookmarks && 
                            <BookmarkTabs active={this.props.context} sections={this.props.userSections}/>
                        }

                        {!this.state.withSidebar && !this.props.bookmarks && <span
                            className="content-bar__menu content-bar__menu--nav"
                            ref={(elem) => this.elemClose = elem}
                            title={gettext('Open filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className="icon--hamburger" />
                        </span>}

                        <SearchBar
                            fetchItems={this.props.fetchItems}
                            setQuery={this.props.setQuery}
                        />

                        <ListViewControls
                            activeView={this.props.activeView}
                            setView={this.props.setView}
                            activeNavigation={this.props.activeNavigation}
                            newsOnly={this.props.newsOnly}
                            toggleNews={this.props.toggleNews}
                            hideNewsOnly={this.props.context !== 'wire'}
                        />
                    </nav>
                </section>,
                <section key="contentMain" className='content-main'>
                    <div className='wire-column--3'>
                        <div className={`wire-column__nav ${this.state.withSidebar?'wire-column__nav--open':''}`}>
                            {this.state.withSidebar &&
                                <SearchSidebar tabs={this.tabs} props={{...this.props}} />
                            }
                        </div>
                        <div className={mainClassName} onScroll={this.onListScroll} ref={(elem) => this.elemList = elem}>
                            <SearchResultsInfo
                                user={this.props.user}
                                query={this.props.activeQuery}
                                bookmarks={this.props.bookmarks}
                                totalItems={this.props.totalItems}
                                topicType={this.props.context === 'wire' ? this.props.context : null}
                                newItems={this.props.newItems}
                                refresh={this.props.fetchItems}
                                activeTopic={this.props.activeTopic}
                                toggleNews={this.props.toggleNews}
                                activeNavigation={this.props.activeNavigation}
                                newsOnly={this.props.newsOnly}
                                scrollClass={this.state.scrollClass}
                            />

                            <ItemsList
                                actions={this.props.actions}
                                activeView={this.props.activeView}
                            />
                        </div>

                        <div className={`wire-column__preview ${this.props.itemToPreview ? 'wire-column__preview--open' : ''}`}>
                            {this.props.itemToPreview &&
                            <WirePreview
                                item={this.props.itemToPreview}
                                user={this.props.user}
                                actions={this.filterActions(this.props.itemToPreview)}
                                followStory={this.props.followStory}
                                isFollowing={!!isFollowing}
                                closePreview={this.props.closePreview}
                                previewConfig={this.props.previewConfig}
                                downloadVideo={this.props.downloadVideo}
                            />
                            }

                        </div>
                    </div>
                </section>
            ]).concat([
                modal,
                this.renderNavBreadcrumb(
                    this.props.navigations,
                    this.props.activeNavigation,
                    this.props.activeTopic),
                this.renderSavedItemsCount(),
            ])
        );
    }
}

WireApp.propTypes = {
    state: PropTypes.object,
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
    itemToPreview: PropTypes.object,
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
    setQuery: PropTypes.func.isRequired,
    bookmarks: PropTypes.bool,
    fetchMoreItems: PropTypes.func,
    activeView: PropTypes.string,
    setView: PropTypes.func,
    followStory: PropTypes.func,
    newItems: PropTypes.array,
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    toggleNews: PropTypes.func,
    newsOnly: PropTypes.bool,
    activeTopic: PropTypes.object,
    savedItemsCount: PropTypes.number,
    userSections: PropTypes.object,
    context: PropTypes.string.isRequired,
    previewConfig: PropTypes.object,
    detailsConfig: PropTypes.object,
    groups: PropTypes.array,
    downloadVideo: PropTypes.func,
};

const mapStateToProps = (state) => ({
    state: state,
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
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
    activeNavigation: get(state, 'search.activeNavigation', null),
    newsOnly: !!get(state, 'wire.newsOnly'),
    bookmarks: state.bookmarks,
    savedItemsCount: state.savedItemsCount,
    userSections: state.userSections,
    activeTopic: activeTopicSelector(state),
    context: state.context,
    previewConfig: get(state.uiConfig, 'preview') || {},
    detailsConfig: get(state.uiConfig, 'details') || {},
    groups: get(state, 'groups', []),
});

const mapDispatchToProps = (dispatch) => ({
    followStory: (item) => dispatch(followTopic({label: item.slugline, query: `slugline:"${item.slugline}"`}, 'wire')),
    fetchItems: () => dispatch(fetchItems()),
    toggleNews: () => {
        dispatch(toggleNews());
        dispatch(fetchItems());
    },
    setQuery: (query) => dispatch(setQuery(query)),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    setView: (view) => dispatch(setView(view)),
    closePreview: () => dispatch(previewItem(null)),
    downloadVideo: (href, id, mimeType) => dispatch(downloadVideo(href, id, mimeType))
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
