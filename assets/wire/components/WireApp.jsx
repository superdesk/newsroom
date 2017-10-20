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
    refreshItems,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';
import SelectedItemsBar from './SelectedItemsBar';

import FollowTopicModal from './FollowTopicModal';
import ShareItemModal from './ShareItemModal';
import DownloadItemsModal from './DownloadItemsModal';

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
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return <Modal data={specs.data} />;
        }
    }

    toggleSidebar(event) {
        event.preventDefault();
        this.setState({withSidebar: !this.state.withSidebar});
    }

    render() {
        const progressStyle = {width: '25%'};
        const modal = this.renderModal(this.props.modal);
        const previewActionFilter = (action) => !action.when || action.when(this.props);
        const multiActionFilter = (action) => action.multi && previewActionFilter(action);
        return (


            [<section key="contentHeader" className='content-header'>
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
                        <div className='dropdown'>
                            <button className='content-bar__dropdown-btn btn dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                Simple search
                            </button>
                            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                                <a className='dropdown-item' href='#'>Simple search</a>
                                <a className='dropdown-item' href='#'>Advanced search</a>
                            </div>
                        </div>
                        <span className='search__icon'>
                            <i className='icon--search icon--gray-light'></i>
                        </span>

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
                            />
                        }

                    </div>
                    {(this.props.isLoading ?
                        <div className='col'>
                            <div className='progress'>
                                <div className='progress-bar' style={progressStyle} />
                            </div>
                        </div>
                        :
                        <div className='wire-column__main container-fluid'>
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

                            {!!this.props.newItemsCount && (
                                <nav className="navbar">
                                    <div className="form-inline">
                                        <button className="btn" onClick={this.props.refreshItems}>
                                            {gettext('Refresh')} <span className="badge badge-secondary">{this.props.newItemsCount}</span>
                                        </button>
                                    </div>
                                </nav>
                            )}

                            <ItemsList actions={this.props.actions.filter(previewActionFilter)}/>
                        </div>
                    )}

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
            </section>]

        );
    }
}

WireApp.propTypes = {
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
    itemToPreview: PropTypes.object,
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
    newItemsCount: PropTypes.number,
    refreshItems: PropTypes.func,
};

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics,
    selectedItems: state.selectedItems,
    bookmarks: state.bookmarks,
    newItemsCount: state.newItemsCount,
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
    refreshItems: () => dispatch(refreshItems()),
    actions: [
        {
            name: gettext('Open'),
            action: (item) => window.open(`/wire/${item._id}`, '_blank'),
        },
        {
            name: gettext('Share'),
            multi: true,
            when: (state) => state.user && state.company,
            action: (items) => dispatch(shareItems(items)),
        },
        {
            name: gettext('Print'),
            action: (item) => window.open(`/wire/${item._id}?print`, '_blank'),
        },
        {
            name: gettext('Copy'),
            action: copyPreviewContents,
        },
        {
            name: gettext('Download'),
            multi: true,
            when: (state) => state.user && state.company,
            action: (items) => dispatch(downloadItems(items)),
        },
        {
            name: gettext('Bookmark'),
            multi: true,
            when: (state) => state.user && !state.bookmarks,
            action: (items) => dispatch(bookmarkItems(items)),
        },
        {
            name: gettext('Remove from bookmarks'),
            multi: true,
            when: (state) => state.user && state.bookmarks,
            action: (items) => dispatch(removeBookmarks(items)),
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
