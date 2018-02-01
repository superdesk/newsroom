import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';

function SearchResultsInfo({
    user,
    query,
    totalItems,
    followTopic,
    bookmarks,
    searchCriteria,
    newItems,
    refresh,
    activeTopic,
}) {
    const isFollowing = user && activeTopic;
    return (
        <div className="d-flex mt-1 mt-sm-3 px-3 align-items-center flex-wrap flex-sm-nowrap">
            <div className="navbar-text search-results-info">
                <span className="search-results-info__num">{totalItems}</span>
                {query && (
                    <span className="search-results-info__text">
                        {gettext('search results for:')}<br />
                        <b>{query}</b>
                    </span>
                )}
            </div>

            {user && !bookmarks && !isEmpty(searchCriteria) && (
                <button
                    disabled={isFollowing}
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => followTopic(searchCriteria)}
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
    totalItems: PropTypes.number,
    followTopic: PropTypes.func,
    bookmarks: PropTypes.bool,
    newItems: PropTypes.array,
    refresh: PropTypes.func,
    searchCriteria: PropTypes.object,
    activeTopic: PropTypes.object,
};

export default SearchResultsInfo;
