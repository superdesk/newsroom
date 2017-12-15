import React from 'react';
import PropTypes from 'prop-types';

import {
    setTopicQuery,
    removeNewItems,
} from 'wire/actions';

function TopicsTab({topics, dispatch, newItemsByTopic, activeTopic}) {
    const clickTopic = (e, topic) => {
        e.preventDefault();
        dispatch(removeNewItems(topic._id));
        dispatch(setTopicQuery(topic));
    };

    return topics.map((topic) => (
        <a href='#' key={topic._id}
            className={`btn btn-block btn-outline-${topic === activeTopic ? 'primary' : 'secondary'}`}
            onClick={(e) => clickTopic(e, topic)}>
            {topic.label}
            {newItemsByTopic && newItemsByTopic[topic._id] && <span className='wire-button__notif'>
                {newItemsByTopic[topic._id].length}
            </span>}
        </a>
    ));
}

TopicsTab.propTypes = {
    topics: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    newItemsByTopic: PropTypes.object,
    activeTopic: PropTypes.object,
};

export default TopicsTab;
