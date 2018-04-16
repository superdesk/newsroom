import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
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
        const displayTotalItems = this.props.bookmarks || !isEmpty(this.props.searchCriteria) || this.props.activeTopic;
        return (
            <div className="d-flex mt-1 mt-sm-3 px-3 align-items-center flex-wrap flex-sm-nowrap">
                <div className="navbar-text search-results-info">
                    {displayTotalItems && <span className="search-results-info__num">{this.props.totalItems}</span>}
                    {this.props.query && (
                        <span className="search-results-info__text">
                            {gettext('search results for:')}<br/>
                            <b>{this.props.query}</b>
                        </span>
                    )}
                </div>


                {this.props.user && !this.props.bookmarks && !isEmpty(this.props.searchCriteria) && (
                    <button
                        disabled={isFollowing}
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => this.props.followTopic(this.props.searchCriteria)}
                    >{gettext('Save as topic')}</button>
                )}

                <div className="d-flex align-items-center ml-auto">
                    {!this.props.activeNavigation && <div className={'d-flex align-items-center'}>
                        <label htmlFor='news-only' className="mr-2">{gettext('News only')}</label>
                        <Toggle
                            id="news-only"
                            defaultChecked={this.props.newsOnly}
                            className='toggle-background'
                            icons={false}
                            onChange={this.props.toggleNews}/>
                    </div>}

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
            </div>
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
};

export default SearchResultsInfo;
