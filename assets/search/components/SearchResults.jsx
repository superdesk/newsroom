import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {gettext} from 'utils';

const SearchResults = ({
    scrollClass,
    showTotalItems,
    showTotalLabel,
    totalItems,
    totalItemsLabel,
    showSaveTopic,
    saveMyTopic,
    saveButtonText,
    children,
}) => (!showTotalItems && !showSaveTopic && !children) ? null : (
    <div className={classNames(
        'wire-column__main-header d-flex mt-0 px-3 align-items-center',
        scrollClass
    )}>
        <div className="d-flex flex-column flex-md-row h-100">
            <div className="navbar-text search-results-info">
                {showTotalItems && (
                    <span className="search-results-info__num">
                        {totalItems}
                    </span>
                )}
                {showTotalLabel && (
                    <span className="search-results-info__text flex-column">
                        {!totalItemsLabel ? (
                            <span>{gettext('search results found')}</span>
                        ) : (
                            <React.Fragment>
                                <span>{gettext('search results for:')}</span>
                                <span className="text-break"><b>{totalItemsLabel}</b></span>
                            </React.Fragment>
                        )}
                    </span>
                )}
            </div>
            {showSaveTopic && (
                <div className="d-none d-md-flex h-100 align-items-center flex-shrink-0">
                    <button
                        className="btn btn-outline-primary btn-sm d-none d-sm-block mb-1 mt-1"
                        onClick={saveMyTopic}
                    >{saveButtonText}</button>
                </div>
            )}
        </div>

        {(showSaveTopic || children) && (
            <div className="d-flex ml-auto align-items-end align-items-md-center h-100 flex-column flex-md-row flex-shrink-0">
                <button
                    className="btn btn-outline-primary btn-sm d-block d-sm-none mb-1 mt-1"
                    onClick={saveMyTopic}
                >{saveButtonText}</button>
                {children}
            </div>
        )}
    </div>
);

SearchResults.propTypes = {
    scrollClass: PropTypes.string,

    showTotalItems: PropTypes.bool,
    showTotalLabel: PropTypes.bool,
    showSaveTopic: PropTypes.bool,

    totalItems: PropTypes.number,
    totalItemsLabel: PropTypes.string,
    saveMyTopic: PropTypes.func,
    saveButtonText: PropTypes.string,
    children: PropTypes.node,
};

SearchResults.defaultProps = {
    showTotalItems: true,
    showTotalLabel: true,
    showSaveTopic: true,
};

export default SearchResults;
