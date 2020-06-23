import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newNavigation,
    fetchNavigations,
} from '../actions';
import {setSearchQuery} from 'search/actions';
import Navigations from './Navigations';
import ListBar from 'components/ListBar';
import SectionSwitch from '../../features/sections/SectionSwitch';
import {sectionsPropType} from '../../features/sections/types';
import {uiSectionsSelector, activeSectionSelector} from '../../features/sections/selectors';


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
                buttonName={gettext('Navigation')}
            >
                <SectionSwitch
                    sections={this.props.sections}
                    activeSection={this.props.activeSection}
                />
            </ListBar>,
            <Navigations
                key="Navigations"
                activeSection={this.props.activeSection}
                sections={this.props.sections}
            />]
        );
    }
}

NavigationsApp.propTypes = {
    newNavigation: PropTypes.func,
    fetchNavigations: PropTypes.func,
    setQuery: PropTypes.func,
    sections: sectionsPropType,
    activeSection: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
    sections: uiSectionsSelector(state),
    activeSection: activeSectionSelector(state),
});

const mapDispatchToProps = {
    newNavigation,
    fetchNavigations,
    setQuery: setSearchQuery,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationsApp);
