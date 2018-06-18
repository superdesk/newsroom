import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import 'react-toggle/style.css';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';
import {isTouchDevice} from '../../utils';

class SearchResultsInfo extends React.Component {
    componentDidMount() {
        if ( !isTouchDevice() ) {
            this.elem && $(this.elem).tooltip();
        }
    }

    componentWillUnmount() {
        this.elem && $(this.elem).tooltip('dispose'); // make sure it's gone
    }

    componentWillUpdate() {
        this.componentWillUnmount();
    }

    componentDidUpdate() {
        this.componentDidMount();
    }


    render() {
        const isFollowing = this.props.user && this.props.activeTopic;
        const displayFollowTopic = this.props.user && !this.props.bookmarks && !isEmpty(this.props.searchCriteria);

        const displayTotalItems = this.props.bookmarks ||
          !isEmpty(this.props.searchCriteria) ||
          this.props.activeTopic ||
          this.props.resultsFiltered;

        const displayHeader = !isEmpty(this.props.newItems) || displayTotalItems || displayFollowTopic || this.props.query;
        return (
            displayHeader ? <div className={classNames(
                'wire-column__main-header d-flex mt-0 px-3 align-items-center flex-wrap flex-sm-nowrap',
                this.props.scrollClass
            )}>
                <div className="navbar-text search-results-info">
                    {displayTotalItems && <span className="search-results-info__num">{this.props.totalItems}</span>}
                    {this.props.query && (
                        <span className="search-results-info__text">
                            {gettext('search results for:')}<br/>
                            <b>{this.props.query}</b>
                        </span>
                    )}
                </div>


                {displayFollowTopic && (
                    <button
                        disabled={isFollowing}
                        className="btn btn-outline-primary btn-sm d-none d-sm-block"
                        onClick={() => this.props.followTopic(this.props.searchCriteria)}
                    >{gettext('Save as topic')}</button>
                )}

                {displayFollowTopic && (
                    <button
                        disabled={isFollowing}
                        className="btn btn-outline-primary btn-sm d-block d-sm-none"
                        onClick={() => this.props.followTopic(this.props.searchCriteria)}
                    >{gettext('S')}</button>
                )}

                <div className="d-flex align-items-center ml-auto">
                    {!isEmpty(this.props.newItems) &&
                      <button
                          type="button"
                          ref={(elem) => this.elem = elem}
                          title={gettext('New stories available to load')}
                          className="button__reset-styles d-flex align-items-center ml-3"
                          onClick={this.props.refresh}>
                          <i className="icon--refresh icon--pink"/>
                          <span className="badge badge-pill badge-info badge-secondary ml-2">{this.props.newItems.length}</span>
                      </button>
                    }
                </div>
            </div> : null
        );
    }
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
    toggleNews: PropTypes.func,
    activeNavigation: PropTypes.string,
    newsOnly: PropTypes.bool,
    scrollClass: PropTypes.string,
    resultsFiltered: PropTypes.bool,
};

export default SearchResultsInfo;
