import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';
import { getActiveDate } from 'local-store';

import NavCreatedPicker from './NavCreatedPicker';
import FilterGroup from './FilterGroup';
import FilterButton from './FilterButton';

import {
    resetFilter,
    toggleFilter,
    setCreatedFilter,
} from 'search/actions';
import {
    searchFilterSelector,
    searchCreatedSelector,
} from 'search/selectors';

import {
    selectDate
} from '../../../agenda/actions';

import { resultsFilteredSelector } from 'search/selectors';

class FiltersTab extends React.Component {
    constructor(props) {
        super(props);

        this.toggleGroup = this.toggleGroup.bind(this);
        this.getFilterGroups = this.getFilterGroups.bind(this);
        this.toggleFilterAndSearch = this.toggleFilterAndSearch.bind(this);
        this.setCreatedFilterAndSearch = this.setCreatedFilterAndSearch.bind(this);
        this.reset = this.reset.bind(this);
        this.state = {
            groups: this.props.groups
        };
    }

    toggleGroup(event, group) {
        event.preventDefault();
        this.setState({groups: this.props.groups.map((_group) =>
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

    reset(event) {
        event.preventDefault();
        this.props.resetFilter();
        this.props.fetchItems();
        if ('function' === typeof this.props.selectDate) {
            this.props.selectDate(getActiveDate() || Date.now().valueOf(), 'day');
        }
    }

    render() {
        const {activeFilter, createdFilter} = this.props;
        const isResetActive = Object.keys(activeFilter).find((key) => !isEmpty(activeFilter[key]))
            || Object.keys(createdFilter).find((key) => !isEmpty(createdFilter[key]));

        return this.getFilterGroups().filter((group) => !!group).concat([
            (<NavCreatedPicker
                key="created"
                createdFilter={createdFilter}
                setCreatedFilter={this.setCreatedFilterAndSearch}
            />),
            !isResetActive && !this.props.resultsFiltered ? null : ([
                <div key="reset-buffer" id="reset-filter-buffer" />,
                <FilterButton
                    key='search'
                    label={gettext('Search')}
                    onClick={(e) => {
                        e.preventDefault();
                        this.props.fetchItems();
                    }}
                    className='search filter-button--border'
                    primary={true}
                />,
                <FilterButton
                    key='reset'
                    label={gettext('Clear filters')}
                    onClick={this.reset}
                    className='reset'
                    primary={false}
                />,
            ]),
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
    groups: PropTypes.array,
    selectDate: PropTypes.func,
};

const mapStateToProps = (state) => ({
    aggregations: state.aggregations,
    activeFilter: searchFilterSelector(state),
    createdFilter: searchCreatedSelector(state),
    resultsFiltered: resultsFilteredSelector(state),
});

const mapDispatchToProps = {
    resetFilter,
    toggleFilter,
    setCreatedFilter,
    selectDate,
};

export default connect(mapStateToProps, mapDispatchToProps)(FiltersTab);
