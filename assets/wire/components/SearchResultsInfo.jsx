import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import 'react-toggle/style.css';
import { connect } from 'react-redux';

import { isEmpty, get } from 'lodash';
import { gettext, isTouchDevice, isWireContext } from 'utils';

import {
    followTopic,
} from 'search/actions';

import {
    searchCriteriaSelector,
    resultsFilteredSelector,
} from 'search/selectors';

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
        if (isEmpty(this.props.newItems) && !displayTotalItems && !displayFollowTopic && !this.props.query) {
            return null;
        }

        const displayTotalItems = this.props.hideTotalItems && (this.props.bookmarks ||
          !isEmpty(this.props.activeTopic) ||
          this.props.resultsFiltered || this.props.query);
        const newItemsLength = get(this.props, 'newItems.length', 0) > 25 ? '25+' : get(this.props, 'newItems.length');
        const newItemsTooltip = !isWireContext() ? gettext('New events to load') : gettext('New stories available to load');

        const isFollowing = this.props.user && this.props.activeTopic;
        const displayFollowTopic = this.props.topicType && this.props.user &&
            !this.props.bookmarks && !this.props.featuredOnly && (this.props.resultsFiltered || this.props.query);

        const onClick = () => (
            this.props.followTopic(this.props.searchCriteria, this.props.topicType, this.props.activeNavigation)
        );

        return (
            <div className={classNames(
                'wire-column__main-header d-flex mt-0 px-3 align-items-center',
                this.props.scrollClass
            )}>
                <div className="d-flex flex-column flex-md-row h-100">
                    <div className="navbar-text search-results-info">
                        {displayTotalItems && <span className="search-results-info__num">{this.props.totalItems}</span>}
                        {this.props.query && (
                            <span className="search-results-info__text flex-column">
                                <span>{gettext('search results for:')}</span>
                                <span className="text-break"><b>{this.props.query}</b></span>
                            </span>
                        )}
                    </div>
                    {displayFollowTopic && (
                        <div className="d-none d-md-flex h-100 align-items-center flex-shrink-0">
                            <button
                                key="btnSaveTopic"
                                disabled={isFollowing}
                                className="btn btn-outline-primary btn-sm d-none d-sm-block mb-1 mt-1"
                                onClick={onClick}
                            >
                                {isWireContext() ? gettext('Save as topic') : gettext('Save search to my events')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="d-flex ml-auto align-items-end align-items-md-center h-100 flex-column flex-md-row flex-shrink-0">
                    {displayFollowTopic && (
                        <button
                            key="btnSaveSearch"
                            disabled={isFollowing}
                            className="btn btn-outline-primary btn-sm d-block d-sm-none mb-1 mt-1"
                            onClick={onClick}
                        >{gettext('Save Search')}</button>
                    )}
                    {!isEmpty(this.props.newItems) &&
                      <button
                          type="button"
                          ref={(elem) => this.elem = elem}
                          title={newItemsTooltip}
                          className="button__reset-styles d-flex align-items-center ml-3"
                          onClick={this.props.refresh}>
                          <i className="icon--refresh icon--pink"/>
                          <span className="badge badge-pill badge-info badge-secondary ml-2">{newItemsLength}</span>
                      </button>
                    }
                </div>
            </div>
        );
    }
}

SearchResultsInfo.propTypes = {
    user: PropTypes.string,
    query: PropTypes.string,
    totalItems: PropTypes.number,
    bookmarks: PropTypes.bool,
    newItems: PropTypes.array,
    refresh: PropTypes.func,
    activeTopic: PropTypes.object,
    toggleNews: PropTypes.func,
    activeNavigation: PropTypes.arrayOf(PropTypes.string),
    newsOnly: PropTypes.bool,
    scrollClass: PropTypes.string,
    topicType: PropTypes.string,
    searchCriteria: PropTypes.object,
    resultsFiltered: PropTypes.bool,
    followTopic: PropTypes.func.isRequired,
    hideTotalItems: PropTypes.bool,
    featuredOnly: PropTypes.bool,
};

SearchResultsInfo.defaultProps = {
    hideTotalItems: true
};

const mapStateToProps = (state) => ({
    searchCriteria: searchCriteriaSelector(state),
    resultsFiltered: resultsFilteredSelector(state),
});

const mapDispatchToProps = {
    followTopic,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsInfo);
