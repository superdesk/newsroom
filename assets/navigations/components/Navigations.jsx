import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';

import {gettext} from 'utils';

import {
    cancelEdit,
    deleteNavigation,
    editNavigation,
    newNavigation,
    postNavigation,
    selectNavigation,
    setError,
    fetchProducts,
    saveProducts,
} from '../actions';
import {sectionsPropType} from 'features/sections/types';
import {uiSectionsSelector} from 'features/sections/selectors';
import {searchQuerySelector} from 'search/selectors';

import EditNavigation from './EditNavigation';
import NavigationList from './NavigationList';
import SearchResults from 'search/components/SearchResults';


class Navigations extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteNavigation = this.deleteNavigation.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.navigationToEdit.name) {
            errors.name = ['Please provide navigation name'];
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

        this.props.saveNavigation();
    }

    deleteNavigation(event) {
        event.preventDefault();

        if (confirm(gettext('Would you like to delete navigation: {{name}}', {name: this.props.navigationToEdit.name}))) {
            this.props.deleteNavigation();
        }
    }

    render() {
        const progressStyle = {width: '25%'};
        const sectionFilter = (navigation) => !this.props.activeSection || get(navigation, 'product_type', 'wire') === this.props.activeSection;

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
                                totalItems={this.props.navigations.length}
                                totalItemsLabel={this.props.activeQuery}
                            />
                        )}
                        <NavigationList
                            navigations={this.props.navigations.filter(sectionFilter)}
                            onClick={this.props.selectNavigation}
                            activeNavigationId={this.props.activeNavigationId} />
                    </div>
                )}
                {this.props.navigationToEdit &&
                    <EditNavigation
                        navigation={this.props.navigationToEdit}
                        onChange={this.props.editNavigation}
                        errors={this.props.errors}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteNavigation}
                        products={this.props.products}
                        saveProducts={this.props.saveProducts}
                        fetchProducts={this.props.fetchProducts}
                        sections={this.props.sections}
                    />
                }
            </div>
        );
    }
}

Navigations.propTypes = {
    activeSection: PropTypes.string.isRequired,
    navigations: PropTypes.arrayOf(PropTypes.object),
    navigationToEdit: PropTypes.object,
    activeNavigationId: PropTypes.string,
    selectNavigation: PropTypes.func,
    editNavigation: PropTypes.func,
    saveNavigation: PropTypes.func,
    deleteNavigation: PropTypes.func,
    newNavigation: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalNavigations: PropTypes.number,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    products: PropTypes.arrayOf(PropTypes.object),
    sections: sectionsPropType,
    saveProducts: PropTypes.func.isRequired,
    fetchProducts: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    navigations: state.navigations.map((id) => state.navigationsById[id]),
    navigationToEdit: state.navigationToEdit,
    activeNavigationId: state.activeNavigationId,
    isLoading: state.isLoading,
    activeQuery: searchQuerySelector(state),
    totalNavigations: state.totalNavigations,
    errors: state.errors,
    products: state.products,
    sections: uiSectionsSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    selectNavigation: (_id) => dispatch(selectNavigation(_id)),
    editNavigation: (event) => dispatch(editNavigation(event)),
    saveNavigation: (type) => dispatch(postNavigation(type)),
    deleteNavigation: (type) => dispatch(deleteNavigation(type)),
    newNavigation: () => dispatch(newNavigation()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    saveProducts: (products) => dispatch(saveProducts(products)),
    fetchProducts: () => dispatch(fetchProducts()),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Navigations);
