import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {noNavigationSelected} from 'search/utils';

import BaseApp from '../../layout/components/BaseApp';
import SearchBar from 'search/components/SearchBar';
import SearchResultsInfo from 'search/components/SearchResultsInfo';
import DownloadItemsModal from '../../wire/components/DownloadItemsModal';
import SelectedItemsBar from 'wire/components/SelectedItemsBar';
import ShareItemModal from '../../components/ShareItemModal';
import BookmarkTabs from 'components/BookmarkTabs';
import WirePreview from '../../wire/components/WirePreview';
import ItemDetails from '../../wire/components/ItemDetails';
import SearchSidebar from '../../wire/components/SearchSidebar';
import getItemActions from '../../wire/item-actions';
import {gettext} from 'utils';

import {
    fetchItems,
    fetchMoreItems,
    previewItem,
} from '../../wire/actions';
import {
    setQuery,
    toggleNavigation
} from '../../search/actions';
import Navigations from './Navigations';
import AmNewsList from './AmNewsList';

import {
    previewConfigSelector,
    detailsConfigSelector,
    advancedSearchTabsConfigSelector,
} from 'ui/selectors';
import {
    searchQuerySelector,
    navigationsSelector,
    searchNavigationSelector,
} from 'search/selectors';


const modals = {
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class AmNewsApp extends BaseApp {
    constructor(props) {
        super(props);
        this.modals = modals;
        this.state = { isMobile: false };    // to cater for responsive behaviour during widnow resize
        this.setIsMobile = this.setIsMobile.bind(this);
        this.tabs = this.tabs.filter((t) => get(this.props.advancedSearchTabConfig, t.id, true));
    }

    getSnapshotBeforeUpdate(prevProps) {
        if (prevProps.itemToOpen && !this.props.itemToOpen && noNavigationSelected(this.props.activeNavigation)) {
            // enable first navigation
            this.props.toggleNavigation(get(this.props, 'navigations[0]'));
        }

        return null;
    }

    componentDidMount() {
        this.setIsMobile();
        window.addEventListener('resize', this.setIsMobile);
    }

    setIsMobile() {
        if (window.innerWidth <= 768 && !this.state.isMobile) {
            this.setState({ isMobile: true });
        } else if (window.innerWidth > 768 && this.state.isMobile) {
            this.setState({ isMobile: false });
        }
    }

    renderItemDetails() {
        return ([
            <ItemDetails
                key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                detailsConfig={this.props.detailsConfig}
                onClose={() => this.props.actions.filter(a => a.id === 'open')[0].action(null)} />
        ]);
    }

    renderListAndPreview() {
        let mainClassName = '';
        const panesCount = [this.state.withSidebar, this.props.itemToPreview].filter((x) => x).length;
        if (this.state.isMobile) {
            mainClassName = classNames('wire-column__main', {
                'wire-articles__one-side-pane': panesCount === 1,
                'wire-articles__two-side-panes': panesCount === 2,
            });
        } else {
            mainClassName = classNames('wire-column__main', {
                'wire-articles__one-side-pane': this.props.itemToPreview,
            });
        }

        const searchResultsLabel = !this.props.activeQuery ?
            null :
            this.props.activeQuery;

        return (
            [
                <section key="contentHeader" className="content-header">
                    <SelectedItemsBar
                        actions={this.props.actions}
                    />
                    <nav className="content-bar navbar justify-content-start flex-nowrap flex-sm-wrap">
                        {this.state.isMobile && this.state.withSidebar && <span
                            className='content-bar__menu content-bar__menu--nav--open'
                            ref={this.setOpenRef}
                            title={gettext('Close filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className="icon--close-thin icon--white"></i>
                        </span>}
                        {this.state.isMobile && !this.state.withSidebar && !this.props.bookmarks && <span
                            className='content-bar__menu content-bar__menu--nav'
                            ref={this.setCloseRef}
                            title={gettext('Open filter panel')}
                            onClick={this.toggleSidebar}>
                            <i className="icon--hamburger"></i>
                        </span>}
                        {this.props.bookmarks &&
                            <BookmarkTabs active="am_news" sections={this.props.userSections}/>
                        }
                        <SearchBar
                            fetchItems={this.props.fetchItems}
                            setQuery={this.props.setQuery}
                        />
                    </nav>
                </section>,
                <section key="contentMain" className="content-main">
                    <div className="wire-column--3">
                        <div className={mainClassName}>
                            {this.state.isMobile && <div
                                className={`wire-column__nav ${this.state.withSidebar?'wire-column__nav--open':''}`}>
                                {this.state.withSidebar &&
                                    <SearchSidebar
                                        tabs={this.tabs}
                                        props={{...this.props, groups: [], addAllOption: false}} />
                                }
                            </div>}
                            {!this.props.bookmarks && !this.state.isMobile &&
                                <div className="wire-column__main-header-agenda d-flex m-0 px-3 align-items-center flex-wrap flex-sm-nowrap">
                                    <Navigations
                                        navigations={this.props.navigations}
                                        toggleNavigation={this.props.toggleNavigation}
                                        activeNavigation={this.props.activeNavigation}
                                        fetchItems={this.props.fetchItems}/>
                                </div>
                            }

                            {(this.props.activeQuery || get(this.props, 'newItems.length', 0) > 0) && (
                                <SearchResultsInfo
                                    user={this.props.user}
                                    query={this.props.activeQuery}
                                    bookmarks={this.props.bookmarks}
                                    totalItems={this.props.totalItems}
                                    newItems={this.props.newItems}
                                    refresh={this.props.fetchItems}
                                    activeNavigation={this.props.activeNavigation}
                                    scrollClass={this.state.scrollClass}
                                    displayTotalItems={this.props.activeQuery}
                                    resultsLabel={searchResultsLabel}
                                />
                            )}

                            <AmNewsList
                                actions={this.props.actions}
                                activeView={'list-view'}
                                onScroll={this.onListScroll}
                                refNode={this.setListRef}
                            />
                        </div>

                        <div className={`wire-column__preview ${this.props.itemToPreview ? 'wire-column__preview--open' : ''}`}>
                            {this.props.itemToPreview &&
                                <WirePreview
                                    item={this.props.itemToPreview}
                                    user={this.props.user}
                                    actions={this.filterActions(this.props.itemToPreview)}
                                    closePreview={this.props.closePreview}
                                    previewConfig={this.props.previewConfig}
                                />
                            }
                        </div>
                    </div>
                </section>
            ]
        );
    }

    render() {
        const modal = this.renderModal(this.props.modal);

        return (
            (this.props.itemToOpen ? this.renderItemDetails() : this.renderListAndPreview())
                .concat([
                    modal,
                    this.renderNavBreadcrumb(
                        this.props.navigations,
                        this.props.activeNavigation,
                        this.props.activeTopic
                    ),
                    this.renderSavedItemsCount(),
                ])
        );
    }
}


AmNewsApp.propTypes = {
    state: PropTypes.object,
    isLoading: PropTypes.bool,
    totalItems: PropTypes.number,
    activeQuery: PropTypes.string,
    itemToPreview: PropTypes.object,
    itemToOpen: PropTypes.object,
    itemsById: PropTypes.object,
    modal: PropTypes.object,
    company: PropTypes.string,
    topics: PropTypes.array,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    setQuery: PropTypes.func.isRequired,
    fetchMoreItems: PropTypes.func,
    newItems: PropTypes.array,
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    savedItemsCount: PropTypes.number,
    userSections: PropTypes.object,
    previewConfig: PropTypes.object,
    detailsConfig: PropTypes.object,
    advancedSearchTabConfig: PropTypes.object,
    context: PropTypes.string,
};

const mapStateToProps = (state) => ({
    state: state,
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: searchQuerySelector(state),
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    itemToOpen: state.openItem ? state.itemsById[state.openItem._id] : null,
    itemsById: state.itemsById,
    modal: state.modal,
    user: state.user,
    company: state.company,
    topics: state.topics || [],
    newItems: state.newItems,
    navigations: navigationsSelector(state),
    activeNavigation: searchNavigationSelector(state),
    bookmarks: state.bookmarks,
    savedItemsCount: state.savedItemsCount,
    userSections: state.userSections,
    previewConfig: previewConfigSelector(state),
    detailsConfig: detailsConfigSelector(state),
    advancedSearchTabConfig: advancedSearchTabsConfigSelector(state),
    context: state.context,
});

const mapDispatchToProps = (dispatch) => ({
    fetchItems: () => dispatch(fetchItems()),
    setQuery: (query) => dispatch(setQuery(query)),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    closePreview: () => dispatch(previewItem(null)),
    toggleNavigation: (navigation) => dispatch(toggleNavigation(navigation)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AmNewsApp);
