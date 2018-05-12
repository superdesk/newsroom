import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { createPortal } from 'react-dom';
import { gettext } from 'utils';

import {
    followTopic,
    fetchItems,
    setQuery,
    selectAll,
    selectNone,
    fetchMoreItems,
    setView,
    refresh,
    previewItem,
    toggleNews,
} from 'wire/actions';

import { getActiveQuery, isTopicActive } from 'wire/utils';

import Preview from './Preview';
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
import { getItemActions } from '../item-actions';
import {isTouchDevice} from '../../utils';

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

    renderNavBreadcrumb(navigations, activeNavigation, activeTopic) {
        const dest = document.getElementById('nav-breadcrumb');
        if (!dest) {
            return null;
        }

        let name = get(navigations.find((nav) => nav._id === activeNavigation), 'name', '');
        if (!name && activeTopic) {
            name = activeTopic.label;
        }

        return createPortal(name , dest);
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

    componentDidMount() {
        if ( !isTouchDevice() ) {
            this.elemOpen && $(this.elemOpen).tooltip();
            this.elemClose && $(this.elemClose).tooltip();
        }
    }

    componentWillUnmount() {
        this.componentWillUpdate();
    }

    componentWillUpdate() {
        this.elemOpen && $(this.elemOpen).tooltip('dispose');
        this.elemClose && $(this.elemClose).tooltip('dispose');
    }

    componentDidUpdate(nextProps) {
        if ((nextProps.activeQuery || this.props.activeQuery) && (nextProps.activeQuery !== this.props.activeQuery)) {
            this.elemList.scrollTop = 0;
        }
        this.componentDidMount();
    }

    render() {
        const modal = this.renderModal(this.props.modal);
        const multiActionFilter = (action) => action.multi &&
            this.props.selectedItems.every((item) => !action.when || action.when(this.props, this.props.itemsById[item]));

        const isFollowing = get(this.props, 'itemToPreview.slugline') && this.props.topics &&
            this.props.topics.find((topic) => topic.query === `slugline:"${this.props.itemToPreview.slugline}"`);
        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        const mainClassName = classNames('wire-column__main container-fluid', {
            'wire-articles__one-side-pane': panesCount === 1,
            'wire-articles__two-side-panes': panesCount === 2,
        });

        const searchCriteria = getActiveQuery(this.props.activeQuery, this.props.activeFilter, this.props.createdFilter);
        const activeTopic = this.props.topics.find((topic) => isTopicActive(topic, searchCriteria));

        return (
            (this.props.itemToOpen ? [<ItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={() => this.props.actions.filter(a => a.id == 'open')[0].action(null)}
            />] : [
                <section key="contentHeader" className='content-header'>
                    {this.props.selectedItems && this.props.selectedItems.length > 0 &&
                        <SelectedItemsBar
                            selectedItems={this.props.selectedItems}
                            selectAll={this.props.selectAll}
                            selectNone={this.props.selectNone}
                            actions={this.props.actions.filter(multiActionFilter)}
                        />
                    }
                    <nav className='content-bar navbar justify-content-start flex-nowrap flex-sm-wrap'>
                        {this.state.withSidebar && <span
                            className='content-bar__menu content-bar__menu--nav--open'
                            ref={(elem) => this.elemOpen = elem}
                            title={gettext('Close filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className='icon--close-thin icon--white'></i>
                        </span>}
                        {!this.state.withSidebar && <span
                            className='content-bar__menu content-bar__menu--nav'
                            ref={(elem) => this.elemClose = elem}
                            title={gettext('Open filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className='icon--hamburger'></i>
                        </span>}

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
                                    activeTopic={activeTopic}
                                    setQuery={this.props.setQuery}
                                    activeQuery={this.props.activeQuery}
                                    navigations={this.props.navigations}
                                    activeNavigation={this.props.activeNavigation}
                                />
                            }
                        </div>
                        <div className={mainClassName} onScroll={this.onListScroll} ref={(elem) => this.elemList = elem}>
                            <SearchResultsInfo
                                user={this.props.user}
                                query={this.props.activeQuery}
                                bookmarks={this.props.bookmarks}
                                totalItems={this.props.totalItems}
                                followTopic={this.props.followTopic}
                                newItems={this.props.newItems}
                                refresh={this.props.refresh}
                                searchCriteria={searchCriteria}
                                activeTopic={activeTopic}
                                toggleNews={this.props.toggleNews}
                                activeNavigation={this.props.activeNavigation}
                                newsOnly={this.props.newsOnly}
                            />

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
                                closePreview={this.props.closePreview}
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
                    activeTopic
                )
            ])
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
    itemsById: PropTypes.object,
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
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    toggleNews: PropTypes.func,
    newsOnly: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    activeFilter: get(state, 'wire.activeFilter'),
    createdFilter: get(state, 'wire.createdFilter'),
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    itemToOpen: state.openItem ? state.itemsById[state.openItem._id] : null,
    itemsById: state.itemsById,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics || [],
    selectedItems: state.selectedItems,
    activeView: get(state, 'wire.activeView'),
    newItems: state.newItems,
    navigations: get(state, 'wire.navigations', []),
    activeNavigation: get(state, 'wire.activeNavigation', null),
    newsOnly: !!state.newsOnly,
    bookmarks: state.bookmarks,
});

const mapDispatchToProps = (dispatch) => ({
    followTopic: (query) => dispatch(followTopic(query)),
    followStory: (item) => dispatch(followTopic({label: item.slugline, query: `slugline:"${item.slugline}"`})),
    fetchItems: () => dispatch(fetchItems()),
    toggleNews: () => {
        dispatch(toggleNews());
        dispatch(fetchItems());
    },
    setQuery: (query) => {
        dispatch(setQuery(query));
        dispatch(fetchItems());
    },
    selectAll: () => dispatch(selectAll()),
    selectNone: () => dispatch(selectNone()),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    setView: (view) => dispatch(setView(view)),
    refresh: () => dispatch(refresh()),
    closePreview: () => dispatch(previewItem(null)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
