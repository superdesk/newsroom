import React from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';

import NavCreatedPicker from './NavCreatedPicker';
import {fetchItems, resetFilter} from 'wire/actions';
import FilterGroup from './FilterGroup';
import FilterButton from './FilterButton';

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
    }

    toggleGroup(event, group) {
        event.preventDefault();
        this.setState({groups: this.state.groups.map((_group) =>
            _group === group ? Object.assign({}, _group, {isOpen: !_group.isOpen}) : _group
        )});
    }

    getFilterGroups() {
        return this.state.groups.map((group) => <FilterGroup
            key={group.label}
            group={group}
            activeFilter={this.props.activeFilter}
            aggregations={this.props.aggregations}
            toggleGroup={this.toggleGroup}
            toggleFilter={this.props.toggleFilter}
        />);
    }

    render() {
        const {activeFilter, createdFilter, dispatch} = this.props;
        const isResetActive = Object.keys(activeFilter).find((key) => !isEmpty(activeFilter[key]))
            || Object.keys(createdFilter).find((key) => !isEmpty(createdFilter[key]));

        return this.getFilterGroups().filter((group) => !!group).concat([
            <NavCreatedPicker key="created" dispatch={dispatch} createdFilter={createdFilter} />,
            isResetActive || this.props.resultsFiltered ? (
                [<div key="reset-buffer" id="reset-filter-buffer"></div>,
                    <FilterButton
                        key='search'
                        label={gettext('Search')}
                        onClick={(e) => {e.preventDefault(); dispatch(fetchItems());}}
                        className='search'/>,
                    <FilterButton
                        key='reset'
                        label={gettext('Clear filters')}
                        onClick={(e) => {e.preventDefault(); dispatch(resetFilter());}}
                        className='reset'/>,
                ]
            ) : null,
        ]);
    }
}

FiltersTab.propTypes = {
    aggregations: PropTypes.object,
    activeFilter: PropTypes.object,
    toggleFilter: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    createdFilter: PropTypes.object.isRequired,
    resultsFiltered: PropTypes.bool.isRequired,
};

export default FiltersTab;
