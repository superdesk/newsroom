import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import {
    newNavigation,
    setQuery,
    fetchNavigations,
} from '../actions';
import Navigations from './Navigations';
import ListBar from 'components/ListBar';
import SectionSwitch from '../../features/sections/SectionSwitch';
import {sectionsPropType} from '../../features/sections/types';


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
    sections: state.sections.list,
    activeSection: state.sections.active,
});

const mapDispatchToProps = {
    newNavigation,
    fetchNavigations,
    setQuery,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationsApp);
