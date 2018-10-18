import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';

import NavCreatedPicker from './NavCreatedPicker';
import FilterGroup from './FilterGroup';
import FilterButton from './FilterButton';

import {
    resetFilter,
    toggleFilter,
    setCreatedFilter,
} from 'search/actions';

import { resultsFilteredSelector } from 'search/selectors';

class FiltersTab extends React.Component {
    constructor(props) {
        super(props);

        this.state = {groups: [
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
                label: gettext('Content Type'),
            },
            {
                field: 'urgency',
                label: gettext('News Value'),
            },
            {
                field: 'place',
                label: gettext('Place'),
            },
        ]};

        this.toggleGroup = this.toggleGroup.bind(this);
        this.getFilterGroups = this.getFilterGroups.bind(this);
        this.toggleFilterAndSearch = this.toggleFilterAndSearch.bind(this);
        this.setCreatedFilterAndSearch = this.setCreatedFilterAndSearch.bind(this);
    }

    toggleGroup(event, group) {
        event.preventDefault();
        this.setState({groups: this.state.groups.map((_group) =>
            _group === group ? Object.assign({}, _group, {isOpen: !_group.isOpen}) : _group
        )});
    }

    toggleFilterAndSearch(field, key, single, wasActive) {
        this.props.toggleFilter(field, key, single);
        wasActive && this.props.resultsFiltered && this.props.fetchItems();
    }

    setCreatedFilterAndSearch(createdFilter) {
        this.props.setCreatedFilter(createdFilter);
        this.props.resultsFiltered && this.props.fetchItems();
    }

    getFilterGroups() {
        return this.state.groups.map((group) => <FilterGroup
            key={group.label}
            group={group}
            activeFilter={this.props.activeFilter}
            aggregations={this.props.aggregations}
            toggleGroup={this.toggleGroup}
            toggleFilter={this.toggleFilterAndSearch}
        />);
    }

    render() {
        const {activeFilter, createdFilter} = this.props;
        const isResetActive = Object.keys(activeFilter).find((key) => !isEmpty(activeFilter[key]))
            || Object.keys(createdFilter).find((key) => !isEmpty(createdFilter[key]));

        return this.getFilterGroups().filter((group) => !!group).concat([
            <NavCreatedPicker
                key="created"
                createdFilter={createdFilter}
                setCreatedFilter={this.setCreatedFilterAndSearch}
            />,
            isResetActive || this.props.resultsFiltered ? (
                [<div key="reset-buffer" id="reset-filter-buffer"></div>,
                    <FilterButton
                        key='search'
                        label={gettext('Search')}
                        onClick={(e) => {
                            e.preventDefault();
                            this.props.fetchItems();
                        }}
                        className='search'/>,
                    <FilterButton
                        key='reset'
                        label={gettext('Clear filters')}
                        onClick={(e) => {
                            e.preventDefault();
                            this.props.resetFilter();
                            this.props.fetchItems();
                        }}
                        className='reset'/>,
                ]
            ) : null,
        ]);
    }
}

FiltersTab.propTypes = {
    aggregations: PropTypes.object,
    activeFilter: PropTypes.object,
    createdFilter: PropTypes.object.isRequired,
    resultsFiltered: PropTypes.bool.isRequired,

    resetFilter: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    setCreatedFilter: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    aggregations: state.aggregations,
    activeFilter: state.search.activeFilter,
    createdFilter: state.search.createdFilter,
    resultsFiltered: resultsFilteredSelector(state),
});

const mapDispatchToProps = {
    resetFilter,
    toggleFilter,
    setCreatedFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(FiltersTab);
