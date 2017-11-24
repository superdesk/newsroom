import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';
import { getActiveQuery, isTopicActive } from 'wire/utils';

function SearchResultsInfo({
    user,
    query,
    totalItems,
    followTopic,
    topics,
    bookmarks,
    activeFilter,
    createdFilter,
    newItems,
    refresh
}) {
    const activeQuery = getActiveQuery(query, activeFilter, createdFilter);
    const isFollowing = user && topics.find((topic) => isTopicActive(topic, activeQuery));
    return (
        <div className="d-flex mt-3 p-0 align-items-center">
            <div className="navbar-text search-results-info">
                <span className="search-results-info__num">{totalItems}</span>
                {query && (
                    <span className="search-results-info__text">
                        {gettext('search results for:')}<br />
                        <b>{query}</b>
                    </span>
                )}
            </div>

            {user && !bookmarks && !isEmpty(activeQuery) && (
                <button
                    disabled={isFollowing}
                    className="btn btn-outline-primary btn-responsive"
                    onClick={() => followTopic(activeQuery)}
                >{gettext('Save as topic')}</button>
            )}

            {!isEmpty(newItems) &&
                <button type="button" className="button__reset-styles d-flex align-items-center ml-auto" onClick={refresh}>
                    <i className="icon--refresh icon--pink" />
                    <span className="badge badge-pill badge-info badge-secondary ml-2">{newItems.length}</span>
                </button>
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
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object,
    newItems: PropTypes.array,
    refresh: PropTypes.func,
};

export default SearchResultsInfo;
