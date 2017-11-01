import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';

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
    removeNewItems,
    openItem,
    fetchNextItems,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';
import SelectedItemsBar from './SelectedItemsBar';

import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from './ShareItemModal';
import DownloadItemsModal from './DownloadItemsModal';
import ItemDetails from './ItemDetails';
import NotificationList from 'components/NotificationList';

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
            this.props.fetchNextItems();
            event.preventDefault();
            event.stopPropagation();
        }
    }

    render() {
        const modal = this.renderModal(this.props.modal);
        const previewActionFilter = (action) => !action.when || action.when(this.props);
        const multiActionFilter = (action) => action.multi && previewActionFilter(action);
        return (
            (this.props.itemToOpen ? [<ItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                actions={this.props.actions.filter(previewActionFilter)}
                onClose={() => this.props.actions.filter(a => a.id == 'open')[0].action(null)}
            />, modal,
            <NotificationList key="notificationList" newItems={this.props.newItems}/>] : [
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
                        <div className='search form-inline'>
                            <SearchBar
                                fetchItems={this.props.fetchItems}
                                setQuery={this.props.setQuery} />
                        </div>

                        <div className='content-bar__right ml-auto'>
                            <div className='content-bar__sort btn-group'>
                                <div className='form-control-plaintext'>
                                Sort by:
                                </div>
                                <button type='button' className='content-bar__dropdown-btn btn dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                Date
                                </button>
                                <div className='dropdown-menu dropdown-menu-right'>
                                    <button className='dropdown-item' type='button'>Date</button>
                                    <button className='dropdown-item' type='button'>Author</button>
                                </div>
                            </div>

                            <div className='btn-group'>
                                <span className='content-bar__menu' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                    <i className='icon--list-view'></i>
                                </span>
                                <div className='dropdown-menu dropdown-menu-right'>
                                    <h6 className='dropdown-header'>Change view</h6>
                                    <button className='dropdown-item' type='button'>Large list</button>
                                    <button className='dropdown-item' type='button'>Compact list</button>
                                    <button className='dropdown-item' type='button'>Grid</button>
                                </div>
                            </div>
                        </div>

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
                                removeNewItems={this.props.removeNewItems}
                            />
                            }

                        </div>
                        <div className='wire-column__main container-fluid' onScroll={this.onListScroll}>
                            {this.props.activeQuery && !this.props.selectedItems.length &&
                                <SearchResultsInfo
                                    user={this.props.user}
                                    query={this.props.activeQuery}
                                    bookmarks={this.props.bookmarks}
                                    totalItems={this.props.totalItems}
                                    followTopic={this.props.followTopic}
                                    topics={this.props.topics}
                                />
                            }

                            <ItemsList actions={this.props.actions.filter(previewActionFilter)}/>
                        </div>

                        <div className={`wire-column__preview ${this.props.itemToPreview ? 'wire-column__preview--open' : ''}`}>
                            {this.props.itemToPreview &&
                            <Preview
                                item={this.props.itemToPreview}
                                actions={this.props.actions.filter(previewActionFilter)}
                            />
                            }

                        </div>
                    </div>
                    {modal}
                    <NotificationList newItems={this.props.newItems}/>
                </section>])
        );
    }
}

WireApp.propTypes = {
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
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
    newItems: PropTypes.array,
    removeNewItems: PropTypes.func,
    fetchNextItems: PropTypes.func,
};

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    itemToOpen: state.openItem ? state.openItem : null,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics,
    selectedItems: state.selectedItems,
    bookmarks: state.bookmarks,
    newItems: state.newItems,
});

const mapDispatchToProps = (dispatch) => ({
    followTopic: (topic) => dispatch(followTopic(topic)),
    fetchItems: () => dispatch(fetchItems()),
    setQuery: (query) => {
        dispatch(setQuery(query));
        dispatch(fetchItems());
    },
    selectAll: () => dispatch(selectAll()),
    selectNone: () => dispatch(selectNone()),
    removeNewItems: (topicId) => dispatch(removeNewItems(topicId)),
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
            icon: 'bookmark',
            multi: true,
            when: (state) => state.user && !state.bookmarks,
            action: (items) => dispatch(bookmarkItems(items)),
        },
        {
            name: gettext('Remove from bookmarks'),
            icon: 'bookmark-remove',
            multi: true,
            when: (state) => state.user && state.bookmarks,
            action: (items) => dispatch(removeBookmarks(items)),
        },
    ],
    fetchNextItems: () => dispatch(fetchNextItems()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
