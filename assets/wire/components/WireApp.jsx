import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { get } from 'lodash';

import {
    followTopic,
    fetchItems,
    copyPreviewContents,
    shareItems,
    setQuery,
    selectAll,
    selectNone,
    bookmarkItems,
    removeBookmarks,
    downloadItems,
    openItem,
    fetchMoreItems,
    setView,
    refresh,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';
import SelectedItemsBar from './SelectedItemsBar';
import ListViewControls from './ListViewControls';
import DownloadItemsModal from './DownloadItemsModal';
import ItemDetails from './ItemDetails';

import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class WireApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            withSidebar: false,
        };
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.onListScroll = this.onListScroll.bind(this);
        this.filterActions = this.filterActions.bind(this);
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return (
                <Modal key="modal" data={specs.data} />
            );
        }
    }

    toggleSidebar(event) {
        event.preventDefault();
        this.setState({withSidebar: !this.state.withSidebar});
    }

    onListScroll(event) {
        const BUFFER = 10;
        const container = event.target;
        if (container.scrollTop + container.offsetHeight + BUFFER >= container.scrollHeight) {
            this.props.fetchMoreItems()
                .catch(() => null); // ignore
        }
    }

    filterActions(item) {
        return this.props.actions.filter((action) => !action.when || action.when(this.props, item));
    }

    render() {
        const modal = this.renderModal(this.props.modal);
        const previewActionFilter = (action) => !action.when || action.when(this.props);
        const multiActionFilter = (action) => action.multi && previewActionFilter(action);

        const isFollowing = get(this.props, 'itemToPreview.slugline') && this.props.topics &&
            this.props.topics.find((topic) => topic.query === `slugline:"${this.props.itemToPreview.slugline}"`);
        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        const mainClassName = classNames('wire-column__main container-fluid', {
            'wire-articles__one-side-pane': panesCount === 1,
            'wire-articles__two-side-panes': panesCount === 2,
        });
        return (
            (this.props.itemToOpen ? [<ItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={() => this.props.actions.filter(a => a.id == 'open')[0].action(null)}
            />, modal] : [
                <section key="contentHeader" className='content-header'>
                    {this.props.selectedItems && this.props.selectedItems.length > 0 &&
                        <SelectedItemsBar
                            selectedItems={this.props.selectedItems}
                            selectAll={this.props.selectAll}
                            selectNone={this.props.selectNone}
                            actions={this.props.actions.filter(multiActionFilter)}
                        />
                    }
                    <nav className='content-bar navbar justify-content-start'>
                        <span className={`content-bar__menu content-bar__menu--nav${this.state.withSidebar?'--open':''}`}
                            onClick={this.toggleSidebar}>
                            <i className={this.state.withSidebar ? 'icon--close-thin icon--white' : 'icon--hamburger'}></i>
                            {/*<i className='icon--close-thin icon--white' onClick={this.toggleSidebar}></i>*/}
                        </span>

                        <SearchBar
                            fetchItems={this.props.fetchItems}
                            setQuery={this.props.setQuery}
                        />

                        <ListViewControls
                            activeView={this.props.activeView}
                            setView={this.props.setView}
                        />
                    </nav>
                </section>,
                <section key="contentMain" className='content-main'>
                    <div className='wire-column--3'>
                        <div className={`wire-column__nav ${this.state.withSidebar?'wire-column__nav--open':''}`}>
                            {this.state.withSidebar &&
                            <SearchSidebar
                                topics={this.props.topics}
                                setQuery={this.props.setQuery}
                                activeQuery={this.props.activeQuery}
                            />
                            }

                        </div>
                        <div className={mainClassName} onScroll={this.onListScroll}>
                            {!this.props.selectedItems.length &&
                                <SearchResultsInfo
                                    user={this.props.user}
                                    query={this.props.activeQuery}
                                    bookmarks={this.props.bookmarks}
                                    totalItems={this.props.totalItems}
                                    followTopic={this.props.followTopic}
                                    topics={this.props.topics}
                                    activeFilter={this.props.activeFilter}
                                    createdFilter={this.props.createdFilter}
                                    newItems={this.props.newItems}
                                    refresh={this.props.refresh}
                                />
                            }

                            <ItemsList
                                actions={this.props.actions}
                                activeView={this.props.activeView}
                            />
                        </div>

                        <div className={`wire-column__preview ${this.props.itemToPreview ? 'wire-column__preview--open' : ''}`}>
                            {this.props.itemToPreview &&
                            <Preview
                                item={this.props.itemToPreview}
                                user={this.props.user}
                                actions={this.filterActions(this.props.itemToPreview)}
                                followStory={this.props.followStory}
                                isFollowing={!!isFollowing}
                            />
                            }

                        </div>
                    </div>
                    {modal}
                </section>])
        );
    }
}

WireApp.propTypes = {
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object,
    itemToPreview: PropTypes.object,
    itemToOpen: PropTypes.object,
    followTopic: PropTypes.func,
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
    selectedItems: PropTypes.array,
    selectAll: PropTypes.func,
    selectNone: PropTypes.func,
    bookmarks: PropTypes.bool,
    fetchMoreItems: PropTypes.func,
    activeView: PropTypes.string,
    setView: PropTypes.func,
    followStory: PropTypes.func,
    newItems: PropTypes.array,
    refresh: PropTypes.func,
};

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    activeFilter: get(state, 'wire.activeFilter'),
    createdFilter: get(state, 'wire.createdFilter'),
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    itemToOpen: state.openItem ? state.openItem : null,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics,
    selectedItems: state.selectedItems,
    activeView: get(state, 'wire.activeView'),
    newItems: state.newItems,
});

const mapDispatchToProps = (dispatch) => ({
    followTopic: (query) => dispatch(followTopic(query)),
    followStory: (item) => dispatch(followTopic({label: item.slugline, query: `slugline:"${item.slugline}"`})),
    fetchItems: () => dispatch(fetchItems()),
    setQuery: (query) => {
        dispatch(setQuery(query));
        dispatch(fetchItems());
    },
    selectAll: () => dispatch(selectAll()),
    selectNone: () => dispatch(selectNone()),
    actions: [
        {
            id: 'open',
            name: gettext('Open'),
            icon: 'text',
            action: (item) => dispatch(openItem(item)),
        },
        {
            name: gettext('Share'),
            icon: 'share',
            multi: true,
            shortcut: true,
            when: (state) => state.user && state.company,
            action: (items) => dispatch(shareItems(items)),
        },
        {
            name: gettext('Print'),
            icon: 'print',
            action: (item) => window.open(`/wire/${item._id}?print`, '_blank'),
        },
        {
            name: gettext('Copy'),
            icon: 'copy',
            action: copyPreviewContents,
        },
        {
            name: gettext('Download'),
            icon: 'download',
            multi: true,
            when: (state) => state.user && state.company,
            action: (items) => dispatch(downloadItems(items)),
        },
        {
            name: gettext('Bookmark'),
            icon: 'bookmark-add',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && (!item || !item.bookmarks ||  !item.bookmarks.includes(state.user)),
            action: (items) => dispatch(bookmarkItems(items)),
        },
        {
            name: gettext('Remove from bookmarks'),
            icon: 'bookmark-remove',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && item && item.bookmarks && item.bookmarks.includes(state.user),
            action: (items) => dispatch(removeBookmarks(items)),
        },
    ],
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    setView: (view) => dispatch(setView(view)),
    refresh: () => dispatch(refresh()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
