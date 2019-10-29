import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {gettext, isWireContext} from 'utils';

import {removeNewItems} from 'wire/actions';
import FilterButton from 'wire/components/filters/FilterButton';
import {loadMyWireTopic} from 'wire/actions';
import {loadMyAgendaTopic} from 'agenda/actions';

const tabName = isWireContext() ? 'Wire Topics' : 'Agenda Topics';
const manageTopics = () => document.dispatchEvent(window.manageTopics);

function TopicsTab({topics, loadMyTopic, newItemsByTopic, activeTopic, removeNewItems}) {
    const clickTopic = (event, topic) => {
        event.preventDefault();
        removeNewItems(topic._id);
        loadMyTopic(topic);
    };

    const clickManage = (event) => {
        event.preventDefault();
        manageTopics();
    };

    const topicClass = (topic) => (
        `btn btn-block btn-outline-${topic._id === activeTopicId ? 'primary' : 'secondary'}`
    );

    const activeTopicId = activeTopic ? activeTopic._id : null;

    return get(topics, 'length', 0) < 1 ? (
        <div className='wire-column__info'>
            {gettext('No {{name}} created.', {name: tabName})}
        </div>
    ) : ([
        <div key="topics">
            {topics.map((topic) => (
                <a href='#'
                    key={topic._id}
                    className={topicClass(topic)}
                    onClick={(e) => clickTopic(e, topic)}
                >
                    {topic.label}
                    {newItemsByTopic && newItemsByTopic[topic._id] && (
                        <span className='wire-button__notif'>
                            {newItemsByTopic[topic._id].length}
                        </span>
                    )}
                </a>
            ))}
            <div key="reset-buffer" id="reset-filter-buffer" />
        </div>,
        <FilterButton
            key='reset'
            label={gettext('Manage my {{name}}', {name: tabName})}
            onClick={clickManage}
            className='reset filter-button--border'
            primary={true}
        />,
    ]);
}

TopicsTab.propTypes = {
    topics: PropTypes.array.isRequired,
    newItemsByTopic: PropTypes.object,
    activeTopic: PropTypes.object,

    removeNewItems: PropTypes.func.isRequired,
    loadMyTopic: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    topics: state.topics || [],
    newItemsByTopic: state.newItemsByTopic,
});

const mapDispatchToProps = (dispatch) => ({
    removeNewItems: (topicId) => dispatch(removeNewItems(topicId)),
    loadMyTopic: (topic) => topic.topic_type === 'agenda' ?
        dispatch(loadMyAgendaTopic(topic._id)) :
        dispatch(loadMyWireTopic(topic._id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopicsTab);
