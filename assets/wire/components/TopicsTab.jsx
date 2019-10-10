import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext, isWireContext } from 'utils';

import {
    setTopicQuery,
    removeNewItems,
} from 'wire/actions';

import {
    setEventQuery,
} from 'agenda/actions';

const tabName = isWireContext() ? 'Wire Topics' : 'Agenda Topics';
const manageTopics = () => document.dispatchEvent(window.manageTopics);

function TopicsTab({topics, setTopicQuery, newItemsByTopic, activeTopic, removeNewItems}) {
    const clickTopic = (e, topic) => {
        e.preventDefault();
        removeNewItems(topic._id);
        setTopicQuery(topic);
    };

    const activeTopicId = activeTopic ? activeTopic._id : null;

    return topics && topics.length > 0 ? [topics.map((topic) => (
        <a href='#' key={topic._id}
            className={`btn btn-block btn-outline-${topic._id === activeTopicId ? 'primary' : 'secondary'}`}
            onClick={(e) => clickTopic(e, topic)}>
            {topic.label}
            {newItemsByTopic && newItemsByTopic[topic._id] && <span className='wire-button__notif'>
                {newItemsByTopic[topic._id].length}
            </span>}
        </a>
    )),
    <a key='manage_topics' href='#' onClick={(event) => {
        event.preventDefault();
        manageTopics();
    }}>{gettext('Manage my {{name}}', {name: tabName})}</a>
    ]
        : <div className='wire-column__info'>{gettext('No {{name}} created.', {name: tabName})}</div>;
}

TopicsTab.propTypes = {
    topics: PropTypes.array.isRequired,
    newItemsByTopic: PropTypes.object,
    activeTopic: PropTypes.object,

    removeNewItems: PropTypes.func.isRequired,
    setTopicQuery: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    topics: state.topics || [],
    newItemsByTopic: state.newItemsByTopic,
});

const mapDispatchToProps = {
    removeNewItems: removeNewItems,
    setTopicQuery: (topic) => topic.topic_type === 'agenda' ? setEventQuery(topic) : setTopicQuery(topic),
};

export default connect(mapStateToProps, mapDispatchToProps)(TopicsTab);
