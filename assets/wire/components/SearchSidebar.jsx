import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { gettext } from 'utils';
import { setService, setFilter } from 'wire/actions';

class SearchSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.tabs = [
            {label: gettext('Navigation'), content: NavigationTab},
            {label: gettext('Filters'), content: FiltersTab},
        ];
        this.state = {active: this.tabs[0]};
        this.selectService = this.selectService.bind(this);
        this.selectFilter = this.selectFilter.bind(this);
    }

    selectService(event, service) {
        event.preventDefault();
        this.props.dispatch(setService(service));
    }

    selectFilter(event, field, value) {
        event.preventDefault();
        this.props.dispatch(setFilter(field, value));
    }

    render() {
        const tabContents = this.tabs.map((tab) => {
            const Tab = tab.content;
            const className = classNames('tab-pane', 'fade', {'show active': this.state.active === tab});
            return (
                <div className='tab-content' key={tab.label}>
                    <div className={className} role='tabpanel'>
                        <Tab
                            services={this.props.services}
                            activeService={this.props.activeService}
                            selectService={this.selectService}
                            activeFilter={this.props.activeFilter}
                            selectFilter={this.selectFilter}
                            aggregations={this.props.aggregations}
                        />
                    </div>
                </div>
            );
        });

        return (
            <div className='wire-column__nav__items'>
                <ul className='nav justify-content-center mb-3' id='pills-tab' role='tablist'>
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
                {tabContents}
            </div>
        );
    }
}

function NavigationTab({services, activeService, selectService}) {
    const allServices = [
        {name: gettext('All'), code: null}
    ].concat(services.filter((service) => service.is_active));

    const isActive = (service) => service === activeService || (!activeService && service.code === null);

    return allServices.map((service) => (
        <a key={service.name}
            href=''
            className={classNames('wire-button', {'wire-button--active': isActive(service)})}
            onClick={(event) => selectService(event, service.code !== null ? service : null)}
        >{service.name}</a>
    ));
}

NavigationTab.propTypes = {
    services: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
    })),
    activeService: PropTypes.object,
    selectService: PropTypes.func.isRequired,
};

function FiltersTab({aggregations, activeFilter, selectFilter}) {
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
        }
    ];

    return groups.map((group) => {
        const activeKey = get(activeFilter, group.field);
        const buckets = aggregations[group.field].buckets.map((bucket) => (
            <a key={bucket.key}
                href=''
                className={classNames('wire-button', {'wire-button--active': activeKey === bucket.key})}
                onClick={(event) => selectFilter(event, group.field, bucket.key)}>{bucket.key}</a>
        ));

        if (!buckets.length) {
            return;
        }

        return (
            <div key={group.field} className="wire-column__nav__group">
                <h5>{group.label}</h5>
                {buckets}
            </div>
        );
    }).filter((group) => !!group);
}

FiltersTab.propTypes = {
    aggregations: PropTypes.object,
    activeFilter: PropTypes.object,
    selectFilter: PropTypes.func.isRequired,
};

SearchSidebar.propTypes = {
    activeQuery: PropTypes.string,
    topics: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
    bookmarkedItems: PropTypes.array.isRequired,
    itemsById: PropTypes.object.isRequired,
    services: PropTypes.array.isRequired,
    aggregations: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    activeService: PropTypes.object,
    activeFilter: PropTypes.object,
};

const mapStateToProps = (state) => ({
    bookmarkedItems: state.bookmarkedItems || [],
    itemsById: state.itemsById,
    services: state.wire.services,
    activeService: state.wire.activeService,
    activeFilter: state.wire.activeFilter,
    aggregations: state.aggregations,
});

export default connect(mapStateToProps)(SearchSidebar);
