import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

import './SearchResultsInfo.scss';

function SearchResultsInfo({query, totalItems}) {
    return (
        <div className="navbar">
            <div className="navbar-text search-results-info">
                <span className="search-results-info__num">{totalItems}</span>
                {gettext('search results for:')}<br />
                <b>{'"'}{query}{'"'}</b>
            </div>
        </div>
    );
}

SearchResultsInfo.propTypes = {
    query: PropTypes.string,
    totalItems: PropTypes.number,
};

export default SearchResultsInfo;
