import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { gettext } from 'utils';
import { toggleService, toggleFilter } from 'wire/actions';

import NavLink from './NavLink';
import NavGroup from './NavGroup';
import NavCreatedPicker from './NavCreatedPicker';

class SearchSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.tabs = [
            {label: gettext('Navigation'), content: NavigationTab},
            {label: gettext('Filters'), content: FiltersTab},
        ];
        this.state = {active: this.tabs[0]};
        this.toggleService = this.toggleService.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
    }

    toggleService(event, service) {
        event.preventDefault();
        this.props.dispatch(toggleService(service));
    }

    toggleFilter(event, field, value, single) {
        event.preventDefault();
        this.props.dispatch(toggleFilter(field, value, single));
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
                            services={this.props.services}
                            activeService={this.props.activeService}
                            toggleService={this.toggleService}
                            activeFilter={this.props.activeFilter}
                            aggregations={this.props.aggregations}
                        />
                        {this.props.topics.length && <span className='wire-column__nav__divider'></span>}
                        <TopicsTab
                            topics={this.props.topics}
                            setQuery={this.props.setQuery}
                            activeQuery={this.props.activeQuery}
                            newItemsByTopic={this.props.newItemsByTopic}
                            removeNewItems={this.props.removeNewItems}
                        />
                    </div>
                </div>
                <div className='tab-content' key={gettext('Filters')}>
                    <div className={classNames('tab-pane', 'fade', {'show active': this.state.active === this.tabs[1]})} role='tabpanel'>
                        <FiltersTab
                            services={this.props.services}
                            activeService={this.props.activeService}
                            activeFilter={this.props.activeFilter}
                            toggleFilter={this.toggleFilter}
                            aggregations={this.props.aggregations}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function NavigationTab({services, activeService, toggleService}) {
    const isActive = (service) => !!activeService[service.code];
    return services.map((service) => (
        <NavLink key={service.name}
            isActive={isActive(service)}
            onClick={(event) => toggleService(event, service)}
            label={service.name}
        />
    ));
}

NavigationTab.propTypes = {
    services: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
    })),
    activeService: PropTypes.object,
    toggleService: PropTypes.func.isRequired,
};

function FiltersTab({aggregations, activeFilter, toggleFilter}) {
    const groups = [
        {
            field: 'service',
            label: gettext('Category'),
        },
        {
            field: 'subject',
            label: gettext('Subject'),
        },
        {
            field: 'genre',
            label: gettext('Genre'),
        },
        {
            field: 'urgency',
            label: gettext('News Value'),
        },
    ];

    return groups.map((group) => {
        const groupFilter = get(activeFilter, group.field, []);
        const buckets = get(aggregations[group.field], 'buckets', group.buckets).map((bucket) => {
            const isActive = groupFilter.indexOf(bucket.key) !== -1;
            return (
                <NavLink key={bucket.key}
                    isActive={isActive}
                    onClick={(event) => toggleFilter(event, group.field, bucket.key, group.single)}
                    label={bucket.label || '' + bucket.key}
                />
            );
        });

        if (!buckets.length) {
            return;
        }

        return (
            <NavGroup key={group.field} label={group.label}>{buckets}</NavGroup>
        );
    }).filter((group) => !!group).concat([
        <NavCreatedPicker key="created" />
    ]);
}

FiltersTab.propTypes = {
    aggregations: PropTypes.object,
    activeFilter: PropTypes.object,
    toggleFilter: PropTypes.func.isRequired,
};

function TopicsTab({topics, setQuery, activeQuery, newItemsByTopic, removeNewItems}) {
    const query = (e, topic) => {
        e.preventDefault();
        removeNewItems(topic._id);
        setQuery(topic.query);
    };
    return topics.map((topic) => (
        <a href='#' key={topic._id}
            className={classNames('btn btn-block btn-outline-secondary', {
                'btn-outline-primary': topic.query === activeQuery,
            })}
            onClick={(e) => query(e, topic)}>
            {topic.label}
            {newItemsByTopic && newItemsByTopic[topic._id] && <span className='wire-button__notif'>
                {newItemsByTopic[topic._id].length}
            </span>}
        </a>
    ));
}

TopicsTab.propTypes = {
    topics: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
    activeQuery: PropTypes.string,
    removeNewItems: PropTypes.func,
    newItemsByTopic: PropTypes.object,
};

SearchSidebar.propTypes = {
    activeQuery: PropTypes.string,
    topics: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
    removeNewItems: PropTypes.func,
    bookmarkedItems: PropTypes.array.isRequired,
    itemsById: PropTypes.object.isRequired,
    services: PropTypes.array.isRequired,
    aggregations: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    activeService: PropTypes.object,
    activeFilter: PropTypes.object,
    newItemsByTopic: PropTypes.object,
};

const mapStateToProps = (state) => ({
    bookmarkedItems: state.bookmarkedItems || [],
    itemsById: state.itemsById,
    services: state.wire.services,
    activeService: state.wire.activeService,
    activeFilter: state.wire.activeFilter,
    aggregations: state.aggregations,
    newItemsByTopic: state.newItemsByTopic,
});

export default connect(mapStateToProps)(SearchSidebar);
