import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';
import { getActiveQuery, isTopicActive } from 'wire/utils';

import './SearchResultsInfo.scss';

function SearchResultsInfo({user, query, totalItems, followTopic, topics, bookmarks, activeFilter, createdFilter}) {
    const activeQuery = getActiveQuery(query, activeFilter, createdFilter);
    const isFollowing = user && topics.find((topic) => isTopicActive(topic, activeQuery));
    return (
        <div className="navbar mt-3 p-0">
            <div className="navbar-text search-results-info">
                <span className="search-results-info__num">{totalItems}</span>
                {query && (
                    <span>
                        {gettext('search results for:')}<br />
                        <b>{'"'}{query}{'"'}</b>
                    </span>
                )}
            </div>
            {user && !bookmarks && !isEmpty(activeQuery) && (
                <button
                    disabled={isFollowing}
                    className="btn btn-outline-primary"
                    onClick={() => followTopic(activeQuery)}
                >{gettext('Follow Topic')}</button>
            )}
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
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object,
};

export default SearchResultsInfo;
