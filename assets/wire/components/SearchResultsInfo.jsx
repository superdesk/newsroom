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
        const isFollowing = this.props.user && this.props.activeTopic;
        const displayFollowTopic = this.props.topicType && this.props.user &&
            !this.props.bookmarks && !this.props.featuredOnly && (this.props.resultsFiltered || this.props.query);
        const displayTotalItems = this.props.hideTotalItems && (this.props.bookmarks ||
          !isEmpty(this.props.activeTopic) ||
          this.props.resultsFiltered || this.props.query);
        const displayHeader = !isEmpty(this.props.newItems) || displayTotalItems || displayFollowTopic || this.props.query;
        const newItemsLength = get(this.props, 'newItems.length', 0) > 25 ? '25+' : get(this.props, 'newItems.length');
        const newItemsTooltip = !isWireContext() ? gettext('New events to load') : gettext('New stories available to load');

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
                        onClick={() => this.props.followTopic(this.props.searchCriteria, this.props.topicType, this.props.activeNavigation)}
                    >{isWireContext() ? gettext('Save as topic') : gettext('Save search to my events')}</button>
                )}

                {displayFollowTopic && (
                    <button
                        disabled={isFollowing}
                        className="btn btn-outline-primary btn-sm d-block d-sm-none"
                        onClick={() => this.props.followTopic(this.props.searchCriteria, this.props.topicType, this.props.activeNavigation)}
                    >{gettext('Save Search')}</button>
                )}

                <div className="d-flex align-items-center ml-auto">
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
            </div> : null
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
    activeNavigation: PropTypes.string,
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
