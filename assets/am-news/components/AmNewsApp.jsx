import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';



import BaseApp from '../../layout/components/BaseApp';
import SearchBar from '../../components/SearchBar';
import SearchResultsInfo from '../../wire/components/SearchResultsInfo';
import DownloadItemsModal from '../../wire/components/DownloadItemsModal';
import SelectedItemsBar from 'wire/components/SelectedItemsBar';
import ShareItemModal from '../../components/ShareItemModal';
import BookmarkTabs from 'components/BookmarkTabs';
import {getItemActions} from '../../wire/item-actions';
import {
    fetchItems,
    fetchMoreItems,
    refresh,
    previewItem,
} from '../../wire/actions';
import {
    setQuery,
    toggleNavigation
} from '../../search/actions';
import Navigations from './Navigations';
import AmNewsList from './AmNewsList';
import AmPreview from './AmPreview';
import AmItemDetails from './AmItemDetails';


const modals = {
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class AmNewsApp extends BaseApp {
    constructor(props) {
        super(props);
        this.modals = modals;
    }

    renderItemDetails() {
        return ([
            <AmItemDetails
                key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={() => this.props.actions.filter(a => a.id === 'open')[0].action(null)}/>
        ]);
    }

    renderListAndPreview() {
        const mainClassName = classNames('wire-column__main', {
            'wire-articles__one-side-pane': this.props.itemToPreview,
        });

        return (
            [
                <section key="contentHeader" className="content-header">
                    <SelectedItemsBar
                        actions={this.props.actions}
                    />
                    <nav className="content-bar navbar justify-content-start flex-nowrap flex-sm-wrap">
                        {this.props.bookmarks &&
                            <BookmarkTabs active="am_news" sections={this.props.userSections}/>
                        }
                        <SearchBar
                            fetchItems={this.props.fetchItems}
                            setQuery={this.props.setQuery}
                        />
                    </nav>
                    {!this.props.bookmarks &&
                        <Navigations
                            navigations={this.props.navigations}
                            toggleNavigation={this.props.toggleNavigation}
                            activeNavigation={this.props.activeNavigation}
                            fetchItems={this.props.fetchItems}/>
                    }
                </section>,
                <section key="contentMain" className="content-main">
                    <div className="wire-column--3">
                        <div className={mainClassName} onScroll={this.onListScroll} ref={(elem) => this.elemList = elem}>
                            <SearchResultsInfo
                                user={this.props.user}
                                query={this.props.activeQuery}
                                bookmarks={this.props.bookmarks}
                                totalItems={this.props.totalItems}
                                newItems={this.props.newItems}
                                refresh={this.props.refresh}
                                activeNavigation={this.props.activeNavigation}
                                scrollClass={this.state.scrollClass}
                            />

                            <AmNewsList
                                actions={this.props.actions}
                                activeView={'list-view'}
                            />
                        </div>

                        <div className={`wire-column__preview ${this.props.itemToPreview ? 'wire-column__preview--open' : ''}`}>
                            {this.props.itemToPreview &&
                                <AmPreview
                                    item={this.props.itemToPreview}
                                    user={this.props.user}
                                    actions={this.filterActions(this.props.itemToPreview)}
                                    closePreview={this.props.closePreview}
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
    newItems: PropTypes.array,
    refresh: PropTypes.func,
    closePreview: PropTypes.func,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    savedItemsCount: PropTypes.number,
    userSections: PropTypes.object,
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
    newItems: state.newItems,
    navigations: get(state, 'search.navigations', []),
    activeNavigation: get(state, 'search.activeNavigation', null),
    bookmarks: state.bookmarks,
    savedItemsCount: state.savedItemsCount,
    userSections: state.userSections,
});

const mapDispatchToProps = (dispatch) => ({
    fetchItems: () => dispatch(fetchItems()),
    setQuery: (query) => dispatch(setQuery(query)),
    actions: getItemActions(dispatch),
    fetchMoreItems: () => dispatch(fetchMoreItems()),
    refresh: () => dispatch(refresh()),
    closePreview: () => dispatch(previewItem(null)),
    toggleNavigation: (navigation) => dispatch(toggleNavigation(navigation))
});

export default connect(mapStateToProps, mapDispatchToProps)(AmNewsApp);
