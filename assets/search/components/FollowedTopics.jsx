import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';
import classNames from 'classnames';

import {gettext} from 'utils';

import {
    fetchTopics,
    shareTopic,
    deleteTopic,
    selectMenuItem,
} from 'user-profile/actions';
import {
    selectedItemSelector,
    selectedMenuSelector,
    topicEditorFullscreenSelector,
} from 'user-profile/selectors';

import MonitoringEditor from 'search/components/MonitoringEditor';
import TopicEditor from 'search/components/TopicEditor';
import TopicList from 'search/components/TopicList';

class FollowedTopics extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.editTopic = this.editTopic.bind(this);
        this.deleteTopic = this.deleteTopic.bind(this);
        this.closeEditor = this.closeEditor.bind(this);
        this.getFilteredTopics = this.getFilteredTopics.bind(this);
        this.onTopicChanged = this.onTopicChanged.bind(this);

        this.actions = [{
            name: gettext('Edit'),
            icon: 'edit',
            action: this.editTopic,
        }];

        if (this.props.topicType !== 'monitoring') {
            this.actions = [
                ...this.actions,
                {
                    name: gettext('Share'),
                    icon: 'share',
                    action: this.props.shareTopic,
                }, {
                    name: gettext('Delete'),
                    icon: 'trash',
                    action: this.deleteTopic,
                }
            ];
        }
    }

    componentDidMount() {
        this.onTopicChanged();
    }

    componentDidUpdate(prevProps) {
        if (get(prevProps, 'selectedMenu') !== get(this.props, 'selectedMenu')) {
            this.closeEditor();
        }
    }

    componentWillUnmount() {
        this.closeEditor();
    }

    editTopic(topic) {
        this.props.selectMenuItem(topic);
    }

    deleteTopic(topic) {
        confirm(
            gettext('Would you like to delete topic {{name}}?', {
                name: topic.label,
            })
        ) && this.props.deleteTopic(topic);
    }

    closeEditor() {
        this.props.selectMenuItem(null);
    }

    getFilteredTopics() {
        if (this.props.topicType === 'monitoring') {
            return this.props.monitoringList;
        }

        return this.props.topics.filter(
            (topic) => topic.topic_type === this.props.topicType
        );
    }

    onTopicChanged() {
        this.props.fetchTopics();
    }

    isMonitoringAdmin() {
        return this.props.monitoringAdministrator === get(this.props, 'user._id');
    }

    render() {
        const editorOpen = this.props.selectedItem;
        const editorOpenInFullscreen = editorOpen && this.props.editorFullscreen;
        const containerClasses = classNames(
            'profile-content profile-content__topics container-fluid pr-0',
            {'pl-0': editorOpenInFullscreen}
        );

        return (
            <div className={containerClasses}>
                {!editorOpenInFullscreen && (
                    <div className="row pt-xl-4 pt-3 px-xl-4 flex-grow-1 mr-0">
                        <TopicList
                            topics={this.getFilteredTopics()}
                            actions={this.actions}
                        />
                    </div>
                )}
                {this.props.selectedItem && (this.props.topicType === 'monitoring' ?
                    <MonitoringEditor
                        item={this.props.selectedItem}
                        closeEditor={this.closeEditor}
                        onTopicChanged={this.onTopicChanged}
                        isAdmin={this.isMonitoringAdmin()}
                    /> :
                    <TopicEditor
                        topic={this.props.selectedItem}
                        closeEditor={this.closeEditor}
                        onTopicChanged={this.onTopicChanged}
                    />)}
            </div>
        );
    }
}

FollowedTopics.propTypes = {
    fetchTopics: PropTypes.func.isRequired,
    topics: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        _created: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
    })),
    topicType: PropTypes.string.isRequired,
    shareTopic: PropTypes.func,
    deleteTopic: PropTypes.func,
    selectMenuItem: PropTypes.func,
    selectedItem: PropTypes.object,
    selectedMenu: PropTypes.string,
    editorFullscreen: PropTypes.bool,
    monitoringList: PropTypes.array,
    monitoringAdministrator: PropTypes.string,
};

const mapStateToProps = (state) => ({
    topics: state.topics,
    monitoringList: state.monitoringList,
    monitoringAdministrator: state.monitoringAdministrator,
    user: state.user,
    selectedItem: selectedItemSelector(state),
    selectedMenu: selectedMenuSelector(state),
    editorFullscreen: topicEditorFullscreenSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    fetchTopics: () => dispatch(fetchTopics()),
    shareTopic: (topic) => dispatch(shareTopic(topic)),
    deleteTopic: (topic) => dispatch(deleteTopic(topic)),
    selectMenuItem: (item) => dispatch(selectMenuItem(item)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FollowedTopics);
