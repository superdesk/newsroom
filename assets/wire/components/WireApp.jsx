import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';

import {
    followTopic,
    fetchItems,
    copyPreviewContents,
} from 'wire/actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';

import FollowTopicModal from './FollowTopicModal';

const modals = {
    followTopic: FollowTopicModal,
};

class WireApp extends React.Component {
    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return <Modal data={specs.data} />;
        }
    }

    render() {
        const progressStyle = {width: '25%'};
        const modal = this.renderModal(this.props.modal);
        return (
            <div>
                <nav className="navbar sticky-top navbar-light bg-light">
                    <SearchBar fetchItems={this.props.fetchItems}/>
                </nav>
                <div className="row">
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
                            actions={this.props.actions}
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
    topics: PropTypes.array,
    fetchItems: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
};

const mapStateToProps = (state) => ({
    isLoading: state.isLoading,
    totalItems: state.totalItems,
    activeQuery: state.activeQuery,
    itemToPreview: state.previewItem ? state.itemsById[state.previewItem] : null,
    modal: state.modal,
    user: state.user,
    topics: state.topics,
});

const mapDispatchToProps = (dispatch) => ({
    followTopic: (topic) => dispatch(followTopic(topic)),
    fetchItems: () => dispatch(fetchItems()),
    actions: [
        {
            name: gettext('Copy'),
            action: copyPreviewContents,
        },
        {
            name: gettext('Print'),
            url: (item) => `/wire/${item._id}?print`,
            target: '_blank',
        },
        {
            name: gettext('Download'),
            url: (item) => `/download/${item._id}?version=${item.version}`,
            download: () => 'newsroom.zip',
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
