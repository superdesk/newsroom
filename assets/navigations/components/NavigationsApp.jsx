import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
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
            <Navigations key="Navigations"
            />]
        );
    }
}

NavigationsApp.propTypes = {
    newNavigation: PropTypes.func,
    fetchNavigations: PropTypes.func,
    setQuery: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
    newNavigation: () => dispatch(newNavigation()),
    fetchNavigations: () => dispatch(fetchNavigations()),
    setQuery: (query) => dispatch(setQuery(query)),
});

export default connect(null, mapDispatchToProps)(NavigationsApp);
