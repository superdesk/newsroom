import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {gettext} from 'utils';

import {
    newSectionFilter,
    fetchSectionFilters,
} from '../actions';
import {setSearchQuery} from 'search/actions';

import SectionSwitch from 'features/sections/SectionSwitch';
import {sectionsPropType} from 'features/sections/types';
import {sectionsSelector, activeSectionSelector} from 'features/sections/selectors';

import SectionFilters from './SectionFilters';
import ListBar from 'components/ListBar';

class SectionFiltersApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return [
            <ListBar key="bar"
                onNewItem={this.props.newSectionFilter}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchSectionFilters}
                buttonName={gettext('Section Filter')}
            >
                <SectionSwitch
                    sections={this.props.sections}
                    activeSection={this.props.activeSection}
                />
            </ListBar>,
            <SectionFilters
                key="sectionFilters"
                activeSection={this.props.activeSection}
                sections={this.props.sections} />
        ];
    }
}

SectionFiltersApp.propTypes = {
    sections: sectionsPropType,
    activeSection: PropTypes.string.isRequired,

    fetchProducts: PropTypes.func,
    setQuery: PropTypes.func,
    newSectionFilter: PropTypes.func,
    fetchSectionFilters: PropTypes.func,
};

const mapStateToProps = (state) => ({
    sections: sectionsSelector(state),
    activeSection: activeSectionSelector(state),
});

const mapDispatchToProps = {
    fetchSectionFilters,
    setQuery: setSearchQuery,
    newSectionFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionFiltersApp);
