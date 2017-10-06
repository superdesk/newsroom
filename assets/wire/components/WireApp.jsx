import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import classNames from 'classnames';

import {
    followTopic,
    fetchItems,
    copyPreviewContents,
    shareItems,
    setQuery,
    selectAll,
    selectNone,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';
import SelectedItemsBar from './SelectedItemsBar';

import FollowTopicModal from './FollowTopicModal';
import ShareItemModal from './ShareItemModal';

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
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
            <div>
                <nav className="navbar sticky-top navbar-light bg-light">
                    <div className="navbar-nav">
                        <div className="nav-item">
                            <a className={classNames('nav-link', {active: this.state.withSidebar})}
                                href="#"
                                onClick={this.toggleSidebar}
                            >{gettext('Sidebar')}</a>
                        </div>
                    </div>
                    <SearchBar fetchItems={this.props.fetchItems} setQuery={this.props.setQuery} />
                </nav>
                <div className="row">
                    {this.state.withSidebar &&
                        <div className="col-2">
                            <SearchSidebar
                                topics={this.props.topics}
                                setQuery={this.props.setQuery}
                                activeQuery={this.props.activeQuery}
                            />
                        </div>
                    }
                    {(this.props.isLoading ?
                        <div className="col">
                            <div className="progress">
                                <div className="progress-bar" style={progressStyle} />
                            </div>
                        </div>
                        :
                        <div className="col">
                            {this.props.activeQuery && !this.props.selectedItems.length &&
                                <SearchResultsInfo
                                    user={this.props.user}
                                    query={this.props.activeQuery}
                                    totalItems={this.props.totalItems}
                                    followTopic={this.props.followTopic}
                                    topics={this.props.topics}
                                />
                            }
                            {!!this.props.selectedItems.length &&
                                <SelectedItemsBar
                                    selectedItems={this.props.selectedItems}
                                    selectAll={this.props.selectAll}
                                    selectNone={this.props.selectNone}
                                    actions={this.props.actions.filter(multiActionFilter)}
                                />
                            }
                            <ItemsList />
                        </div>
                    )}
                    {this.props.itemToPreview &&
                        <Preview
                            item={this.props.itemToPreview}
                            actions={this.props.actions.filter(previewActionFilter)}
                        />
                    }
                </div>
                {modal}
            </div>
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
            action: (items) => window.open(`/download/${items.join(',')}`, '_blank'),
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
