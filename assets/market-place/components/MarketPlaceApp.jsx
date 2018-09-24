import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { activeTopicSelector } from 'search/selectors';
import {
    toggleNavigation
} from '../../search/actions';
import {
    fetchItems
} from '../../wire/actions';
import WireApp from '../../wire/components/WireApp';
import NavigationCardsList from '../../home/components/NavigationCardsList';


class MarketPlaceApp extends React.Component {
    constructor(props) {
        super(props);
        this.onNavigationClick = this.onNavigationClick.bind(this);
    }

    onNavigationClick(nav) {
        return this.props.fetchItems(nav);
    }

    render() {
        const { activeNavigation, bookmarks, navigations, activeTopic } = this.props;

        return !activeNavigation && !bookmarks && !activeTopic &&
            <NavigationCardsList key="navs"
                navigations={navigations}
                onNavigationClick={this.onNavigationClick} /> ||
            <WireApp key="wire"/>;
    }
}


MarketPlaceApp.propTypes = {
    state: PropTypes.object,
    user: PropTypes.string,
    company: PropTypes.string,
    navigations: PropTypes.array.isRequired,
    activeNavigation: PropTypes.string,
    userSections: PropTypes.object,
    fetchItems: PropTypes.func,
    bookmarks: PropTypes.bool,
    savedItemsCount: PropTypes.number,
    activeTopic: PropTypes.object,
};

const mapStateToProps = (state) => ({
    state: state,
    user: state.user,
    company: state.company,
    navigations: get(state, 'search.navigations', []),
    activeNavigation: get(state, 'search.activeNavigation', null),
    userSections: state.userSections,
    bookmarks: state.bookmarks,
    savedItemsCount: state.savedItemsCount,
    activeTopic: activeTopicSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
    fetchItems: (navigation) => {
        dispatch(toggleNavigation(navigation));
        return dispatch(fetchItems());
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(MarketPlaceApp);
