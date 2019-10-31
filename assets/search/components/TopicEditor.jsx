import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get, set, cloneDeep} from 'lodash';
import classNames from 'classnames';

import {gettext, notify} from 'utils';

import TopicForm from './TopicForm';
import TopicParameters from './TopicParameters';
import {fetchNavigations} from 'navigations/actions';
import {submitFollowTopic as submitWireFollowTopic} from 'search/actions';
import {submitFollowTopic as submitProfileFollowTopic, hideModal, setTopicEditorFullscreen} from 'user-profile/actions';
import {topicEditorFullscreenSelector} from 'user-profile/selectors';
import {loadMyWireTopic} from 'wire/actions';
import {loadMyAgendaTopic} from 'agenda/actions';

class TopicEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            topic: null,
            saving: false,
            valid: false,
        };

        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.saveTopic = this.saveTopic.bind(this);
    }

    componentDidMount() {
        this.props.fetchNavigations();

        if (this.props.topic != null) {
            this.changeTopic(this.props.topic);
        }
    }

    componentDidUpdate(prevProps) {
        if (get(prevProps, 'topic._id') !== get(this.props, 'topic._id')) {
            this.changeTopic(this.props.topic);
        }
    }

    changeTopic(topic) {
        this.setState({
            topic: topic,
            saving: false,
            valid: !get(topic, '_id'),
        }, () => {
            this.updateFormValidity(topic);
        });
    }

    updateFormValidity(topic) {
        const original = get(this.props, 'topic') || {};

        if (!topic.label) {
            // The topic must have a label so disable the save button
            this.setState({valid: false});
        } else if (original.label !== topic.label || original.notifications !== topic.notifications) {
            // If the label or notification have changed, then enable the save button
            this.setState({valid: true});
        } else if (original._id) {
            // Otherwise the form is not dirty
            // Set the valid flag to true if in fullscreen
            this.setState({valid: this.props.editorFullscreen});
        }
    }

    onChangeHandler(field) {
        return (event) => {
            const topic = cloneDeep(this.state.topic);
            const value = field === 'notifications' ?
                !get(this.state, 'topic.notifications') :
                event.target.value;

            set(topic, field, value);
            this.setState({topic});
            this.updateFormValidity(topic);
        };
    }

    saveTopic(event) {
        const topic = cloneDeep(this.state.topic);
        const isExisting = !this.isNewTopic();
        const isAgendaTopic = this.isAgendaTopic();

        event.preventDefault();
        this.setState({saving: true});
        this.props.saveTopic(
            isExisting,
            topic
        )
            .then((savedTopic) => {
                this.setState({saving: false});
                this.props.onTopicChanged();
                this.props.closeEditor();

                if (isExisting) {
                    notify.success(isAgendaTopic ?
                        gettext('Agenda Topic updated successfully') :
                        gettext('Wire Topic updated successfully')
                    );
                } else {
                    notify.success(isAgendaTopic ?
                        gettext('Agenda Topic created successfully') :
                        gettext('Wire Topic created successfully')
                    );

                    this.props.loadMyTopic(savedTopic);
                }

                if (this.props.editorFullscreen) {
                    this.props.hideModal();
                    this.props.setTopicEditorFullscreen(false);
                }
            });
    }

    isNewTopic() {
        return !get(this.state, 'topic._id');
    }

    isAgendaTopic() {
        return get(this.state, 'topic.topic_type') === 'agenda';
    }

    getTitle() {
        if (this.isNewTopic()) {
            return this.isAgendaTopic() ?
                gettext('Create new Agenda Topic') :
                gettext('Create new Wire Topic');
        } else {
            return this.isAgendaTopic() ?
                gettext('Save Agenda Topic') :
                gettext('Save Wire Topic');
        }
    }

    render() {
        // Wait for navigations to be loaded
        if (get(this.props, 'navigations.length', 0) < 1) {
            return null;
        }

        const containerClasses = classNames(
            'list-item__preview',
            {'list-item__preview--new': this.props.editorFullscreen}
        );

        return (
            <div className={containerClasses}>
                <div className="list-item__preview-header">
                    <h3>{this.getTitle()}</h3>
                    <button
                        id="hide-sidebar"
                        type="button"
                        className="icon-button"
                        onClick={this.props.closeEditor}
                        disabled={this.state.saving}
                    >
                        <i className="icon--close-thin icon--gray" />
                    </button>
                </div>
                <div className="list-item__preview-form">
                    {this.state.topic && ([
                        <TopicForm
                            key="form"
                            topic={this.state.topic}
                            save={this.saveTopic}
                            onChange={this.onChangeHandler}
                        />,
                        <TopicParameters
                            key="params"
                            topic={this.state.topic}
                            navigations={this.props.navigations}
                        />
                    ])}
                </div>
                <div className="list-item__preview-footer">
                    <input
                        type="button"
                        className="btn btn-outline-secondary"
                        value={gettext('Cancel')}
                        onClick={this.props.closeEditor}
                        disabled={this.state.saving}
                    />
                    <input
                        type="button"
                        className="btn btn-outline-primary"
                        value={gettext('Save')}
                        onClick={this.saveTopic}
                        disabled={this.state.saving || !this.state.valid}
                    />
                </div>
            </div>
        );
    }
}

TopicEditor.propTypes = {
    topic: PropTypes.object,
    navigations: PropTypes.arrayOf(PropTypes.object),
    fetchNavigations: PropTypes.func,
    closeEditor: PropTypes.func,
    saveTopic: PropTypes.func,
    onTopicChanged: PropTypes.func,
    hideModal: PropTypes.func,
    loadMyTopic: PropTypes.func,
    editorFullscreen: PropTypes.bool,
    setTopicEditorFullscreen: PropTypes.func,
};

const mapStateToProps = (state) => ({
    navigations: state.navigations || [],
    editorFullscreen: topicEditorFullscreenSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    fetchNavigations: () => dispatch(fetchNavigations()),
    hideModal: () => dispatch(hideModal()),
    saveTopic: (isExisting, topic) => isExisting ?
        dispatch(submitProfileFollowTopic(topic)) :
        dispatch(submitWireFollowTopic(topic)),
    loadMyTopic: (topic) => topic.topic_type === 'agenda' ?
        dispatch(loadMyAgendaTopic(topic._id)) :
        dispatch(loadMyWireTopic(topic._id)),
    setTopicEditorFullscreen: (fullscreen) => dispatch(setTopicEditorFullscreen(fullscreen)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopicEditor);
