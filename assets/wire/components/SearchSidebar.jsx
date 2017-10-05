import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext } from 'utils';

export default function SearchSidebar({topics, setQuery, activeQuery}) {
    if (!topics.length) {
        return (
            <div>{gettext('There are no topics.')}</div>
        );
    }

    const topicsList = topics.map((topic) => (
        <button key={topic._id}
            className={classNames('list-group-item', 'list-group-item-action', {
                active: topic.query === activeQuery,
            })}
            onClick={() => setQuery(topic.query)}
        >{topic.label}</button>
    ));

    return (
        <div className="list-group">{topicsList}</div>
    );
}

SearchSidebar.propTypes = {
    activeQuery: PropTypes.string,
    topics: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
};
