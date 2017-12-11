import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    selectNavigation,
    editNavigation,
    cancelEdit,
    postNavigation,
    deleteNavigation,
    newNavigation,
    setQuery,
    fetchNavigations,
} from '../actions';
import Navigations from './Navigations';
import ListBar from 'components/ListBar';


class NavigationsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="NavigationBar"
                onNewItem={this.props.newNavigation}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchNavigations}
                buttonName={'Navigation'}
            />,
            <Navigations
                key="Navigations"
                navigations={this.props.navigations}
                navigationToEdit={this.props.navigationToEdit}
                activeNavigationId={this.props.activeNavigationId}
                selectNavigation={this.props.selectNavigation}
                editNavigation={this.props.editNavigation}
                saveNavigation={this.props.saveNavigation}
                deleteNavigation={this.props.deleteNavigation}
                newNavigation={this.props.newNavigation}
                cancelEdit={this.props.cancelEdit}
                isLoading={this.props.isLoading}
                activeQuery={this.props.activeQuery}
                totalNavigations={this.props.totalNavigations}
                errors={this.props.errors}
                dispatch={this.props.dispatch}

            />]
        );
    }
}

NavigationsApp.propTypes = {
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
    fetchNavigations: PropTypes.func,
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

const mapStateToProps = (state) => ({
    navigations: state.navigations.map((id) => state.navigationsById[id]),
    navigationToEdit: state.navigationToEdit,
    activeNavigationId: state.activeNavigationId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalNavigations: state.totalNavigations,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectNavigation: (_id) => dispatch(selectNavigation(_id)),
    editNavigation: (event) => dispatch(editNavigation(event)),
    saveNavigation: (type) => dispatch(postNavigation(type)),
    deleteNavigation: (type) => dispatch(deleteNavigation(type)),
    newNavigation: () => dispatch(newNavigation()),
    fetchNavigations: () => dispatch(fetchNavigations()),
    setQuery: (query) => dispatch(setQuery(query)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationsApp);
