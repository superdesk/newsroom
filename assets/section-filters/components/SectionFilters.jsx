import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {gettext} from 'utils';

import {
    setError,
    postSectionFilter,
    editSectionFilter,
    selectSectionFilter,
    deleteSectionFilter,
    newSectionFilter,
    cancelEdit
} from '../actions';

import {sectionsPropType} from 'features/sections/types';
import {sectionsSelector} from 'features/sections/selectors';
import {searchQuerySelector} from 'search/selectors';

import EditSectionFilter from './EditSectionFilter';
import SectionFilterList from './SectionFilterList';
import SearchResults from 'search/components/SearchResults';

class SectionFilters extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteSectionFilter = this.deleteSectionFilter.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.sectionFilterToEdit.name) {
            errors.name = ['Please provide Section Filter name'];
            valid = false;
        }

        this.props.dispatch(setError(errors));
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveSectionFilter();
    }

    deleteSectionFilter(event) {
        event.preventDefault();

        if (confirm(gettext('Would you like to delete Section Filter: {{name}}', {name: this.props.sectionFilterToEdit.name}))) {
            this.props.deleteSectionFilter();
        }
    }

    render() {
        const progressStyle = {width: '25%'};
        const sectionFilter = (sectionFilter) => !this.props.activeSection || get(sectionFilter, 'filter_type', 'wire') === this.props.activeSection;
        const getActiveSection = () => this.props.sections.filter(s => s._id === this.props.activeSection);

        return (
            <div className="flex-row">
                {(this.props.isLoading ?
                    <div className="col d">
                        <div className="progress">
                            <div className="progress-bar" style={progressStyle} />
                        </div>
                    </div>
                    :
                    <div className="flex-col flex-column">
                        {this.props.activeQuery && (
                            <SearchResults
                                showTotalItems={true}
                                showTotalLabel={true}
                                showSaveTopic={false}
                                totalItems={this.props.totalSectionFilters}
                                totalItemsLabel={this.props.activeQuery}
                            />
                        )}
                        <SectionFilterList
                            sectionFilters={this.props.sectionFilters.filter(sectionFilter)}
                            onClick={this.props.selectSectionFilter}
                            activeSectionFilterId={this.props.activeSectionFilterId} />
                    </div>
                )}
                {this.props.sectionFilterToEdit &&
                    <EditSectionFilter
                        sectionFilter={this.props.sectionFilterToEdit}
                        onChange={this.props.editSectionFilter}
                        errors={this.props.errors}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteSectionFilter}
                        sections={getActiveSection()}
                    />
                }
            </div>
        );
    }
}

SectionFilters.propTypes = {
    activeSection: PropTypes.string.isRequired,
    sectionFilters: PropTypes.arrayOf(PropTypes.object),
    sectionFilterToEdit: PropTypes.object,
    activeSectionFilterId: PropTypes.string,
    selectSectionFilter: PropTypes.func,
    editSectionFilter: PropTypes.func,
    saveSectionFilter: PropTypes.func,
    deleteSectionFilter: PropTypes.func,
    newSectionFilter: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalSectionFilters: PropTypes.number,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    sections: sectionsPropType,
};

const mapStateToProps = (state) => ({
    sectionFilters: state.sectionFilters.map((id) => state.sectionFiltersById[id]),
    sectionFilterToEdit: state.sectionFilterToEdit,
    activeSectionFilterId: state.activeSectionFilterId,
    isLoading: state.isLoading,
    activeQuery: searchQuerySelector(state),
    totalSectionFilters: state.totalSectionFilters,
    errors: state.errors,
    sections: sectionsSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    selectSectionFilter: (_id) => dispatch(selectSectionFilter(_id)),
    editSectionFilter: (event) => dispatch(editSectionFilter(event)),
    saveSectionFilter: (type) => dispatch(postSectionFilter(type)),
    deleteSectionFilter: (type) => dispatch(deleteSectionFilter(type)),
    newSectionFilter: () => dispatch(newSectionFilter()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(SectionFilters);
