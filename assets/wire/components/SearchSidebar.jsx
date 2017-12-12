import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { gettext } from 'utils';

import {
    toggleNavigation,
    toggleFilter,
    resetFilter,
    setTopicQuery,
    removeNewItems,
} from 'wire/actions';

import { getActiveQuery, isTopicActive } from 'wire/utils';

import NavLink from './NavLink';
import FiltersTab from './FiltersTab';

class SearchSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.tabs = [
            {label: gettext('Navigation'), content: NavigationTab},
            {label: gettext('Filters'), content: FiltersTab},
        ];
        this.state = {active: this.tabs[0]};
        this.toggleNavigation = this.toggleNavigation.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.resetFilter = this.resetFilter.bind(this);
    }

    toggleNavigation(event, navigation) {
        event.preventDefault();
        this.props.dispatch(toggleNavigation(navigation));
    }

    toggleFilter(event, field, value, single) {
        event.preventDefault();
        this.props.dispatch(toggleFilter(field, value, single));
    }

    resetFilter(event) {
        event.preventDefault();
        this.props.dispatch(resetFilter());
    }

    render() {
        return (
            <div className='wire-column__nav__items'>
                <ul className='nav justify-content-center' id='pills-tab' role='tablist'>
                    {this.tabs.map((tab) => (
                        <li className='wire-column__nav__tab nav-item' key={tab.label}>
                            <a className={`nav-link ${this.state.active === tab && 'active'}`}
                                role='tab'
                                href=''
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.setState({active: tab});
                                }}>{tab.label}</a>
                        </li>
                    ))}
                </ul>
                <div className='tab-content' key={gettext('Navigation')}>
                    <div className={classNames('tab-pane', 'fade', {'show active': this.state.active === this.tabs[0]})} role='tabpanel'>
                        <NavigationTab
                            navigations={this.props.navigations}
                            activeNavigation={this.props.activeNavigation}
                            toggleNavigation={this.toggleNavigation}
                        />
                        {this.props.topics.length && <span className='wire-column__nav__divider'></span>}
                        <TopicsTab
                            dispatch={this.props.dispatch}
                            topics={this.props.topics}
                            query={this.props.activeQuery}
                            newItemsByTopic={this.props.newItemsByTopic}
                            createdFilter={this.props.createdFilter}
                            activeFilter={this.props.activeFilter}
                        />
                    </div>
                </div>
                <div className='tab-content' key={gettext('Filters')}>
                    <div className={classNames('tab-pane', 'fade', {'show active': this.state.active === this.tabs[1]})} role='tabpanel'>
                        <FiltersTab
                            activeFilter={this.props.activeFilter}
                            aggregations={this.props.aggregations}
                            toggleFilter={this.toggleFilter}
                            resetFilter={this.resetFilter}
                            dispatch={this.props.dispatch}
                            createdFilter={this.props.createdFilter}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function NavigationTab({navigations, activeNavigation, toggleNavigation}) {
    return [
        <NavLink key="all"
            isActive={!activeNavigation}
            onClick={(event) => toggleNavigation(event)}
            label={gettext('All')}
        />
    ].concat(navigations.map((navigation) => (
        <NavLink key={navigation.name}
            isActive={activeNavigation === navigation._id}
            onClick={(event) => toggleNavigation(event, navigation)}
            label={navigation.name}
        />
    )));
}

NavigationTab.propTypes = {
    navigations: PropTypes.arrayOf(PropTypes.object),
    activeNavigation: PropTypes.string,
    toggleNavigation: PropTypes.func.isRequired,
};

function TopicsTab({topics, dispatch, query, activeFilter, createdFilter, newItemsByTopic}) {
    const clickTopic = (e, topic) => {
        e.preventDefault();
        dispatch(removeNewItems(topic._id));
        dispatch(setTopicQuery(topic));
    };

    const activeQuery = getActiveQuery(query, activeFilter, createdFilter);

    return topics.map((topic) => (
        <a href='#' key={topic._id}
            className={`btn btn-block btn-outline-${isTopicActive(topic, activeQuery) ? 'primary' : 'secondary'}`}
            onClick={(e) => clickTopic(e, topic)}>
            {topic.label}
            {newItemsByTopic && newItemsByTopic[topic._id] && <span className='wire-button__notif'>
                {newItemsByTopic[topic._id].length}
            </span>}
        </a>
    ));
}

TopicsTab.propTypes = {
    topics: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object,
    query: PropTypes.string,
    newItemsByTopic: PropTypes.object,
};

SearchSidebar.propTypes = {
    activeQuery: PropTypes.string,
    topics: PropTypes.array.isRequired,
    bookmarkedItems: PropTypes.array.isRequired,
    itemsById: PropTypes.object.isRequired,
    navigations: PropTypes.array.isRequired,
    aggregations: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    activeNavigation: PropTypes.string,
    activeFilter: PropTypes.object,
    newItemsByTopic: PropTypes.object,
    createdFilter: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    bookmarkedItems: state.bookmarkedItems || [],
    itemsById: state.itemsById,
    navigations: state.wire.navigations,
    activeNavigation: state.wire.activeNavigation,
    activeFilter: state.wire.activeFilter,
    aggregations: state.aggregations,
    newItemsByTopic: state.newItemsByTopic,
    createdFilter: state.wire.createdFilter,
});

export default connect(mapStateToProps)(SearchSidebar);
