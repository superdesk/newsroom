import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

import './SearchResultsInfo.scss';

function SearchResultsInfo({user, query, totalItems, followTopic, topics, bookmarks}) {
    const isFollowing = user && topics.find((topic) => topic.query === query);
    return (
        <div className="navbar">
            <div className="navbar-text search-results-info">
                <span className="search-results-info__num">{totalItems}</span>
                {gettext('search results for:')}<br />
                <b>{'"'}{query}{'"'}</b>
            </div>
            {user && !bookmarks &&
            <button
                disabled={isFollowing}
                className="btn btn-outline-primary"
                onClick={() => followTopic(query)}
            >{gettext('Follow Topic')}</button>
            }
        </div>
    );
}

SearchResultsInfo.propTypes = {
    user: PropTypes.string,
    query: PropTypes.string,
    topics: PropTypes.array,
    totalItems: PropTypes.number,
    followTopic: PropTypes.func,
    bookmarks: PropTypes.bool,
};

export default SearchResultsInfo;
