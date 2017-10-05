import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import classNames from 'classnames';

import {
    followTopic,
    fetchItems,
    copyPreviewContents,
    shareItem,
    setQuery,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';
import SearchSidebar from './SearchSidebar';

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
                            {this.props.activeQuery &&
                            <SearchResultsInfo
                                user={this.props.user}
                                query={this.props.activeQuery}
                                totalItems={this.props.totalItems}
                                followTopic={this.props.followTopic}
                                topics={this.props.topics}
                            />
                            }
                            <ItemsList />
                        </div>
                    )}
                    {this.props.itemToPreview &&
                        <Preview
                            item={this.props.itemToPreview}
                            actions={this.props.actions.filter((action) => !action.when || action.when(this.props))}
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
});

const mapDispatchToProps = (dispatch) => ({
    followTopic: (topic) => dispatch(followTopic(topic)),
    fetchItems: () => dispatch(fetchItems()),
    setQuery: (query) => {
        dispatch(setQuery(query));
        dispatch(fetchItems());
    },
    actions: [
        {
            name: gettext('Open'),
            url: (item) => `/wire/${item._id}`,
            target: '_blank',
        },
        {
            name: gettext('Share'),
            action: (item) => dispatch(shareItem(item._id)),
            when: (state) => state.user && state.company,
        },
        {
            name: gettext('Print'),
            url: (item) => `/wire/${item._id}?print`,
            target: '_blank',
        },
        {
            name: gettext('Copy'),
            action: copyPreviewContents,
        },
        {
            name: gettext('Download'),
            url: (item) => `/download/${item._id}?version=${item.version}`,
            download: () => 'newsroom.zip',
            when: (state) => state.user && state.company,
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
