import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { createPortal } from 'react-dom';
import { isTouchDevice, gettext, isDisplayed } from 'utils';

// tabs
import TopicsTab from 'search/components/TopicsTab';
import FiltersTab from 'wire/components/filters/FiltersTab';
import NavigationTab from 'wire/components/filters/NavigationTab';

export default class BaseApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            withSidebar: false,
            scrollClass: '',
        };

        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.onListScroll = this.onListScroll.bind(this);
        this.filterActions = this.filterActions.bind(this);

        this.tabs = [
            {id: 'nav', label: gettext('Topics'), component: NavigationTab},
            {id: 'topics', label: gettext('My Topics'), component: TopicsTab},
            {id: 'filters', label: gettext('Filters'), component: FiltersTab},
        ];
    }

    renderModal(specs) {
        if (specs) {
            const Modal = this.modals[specs.modal];
            return (
                <Modal key="modal" data={specs.data} />
            );
        }
    }

    renderNavBreadcrumb(navigations, activeNavigation, activeTopic) {
        const dest = document.getElementById('nav-breadcrumb');
        if (!dest) {
            return null;
        }

        let name;
        const numNavigations = get(activeNavigation, 'length', 0);

        if (activeTopic) {
            name = `/ ${activeTopic.label}`;
        } else if (numNavigations > 1) {
            name = '/ ' + gettext('Custom View');
        } else if (numNavigations === 1) {
            name = '/ ' + get(navigations.find((nav) => nav._id === activeNavigation[0]), 'name', '');
        } else {
            name = '';
        }

        return createPortal(name , dest);
    }

    renderSavedItemsCount() {
        const dest = document.getElementById('saved-items-count');
        if (!dest) {
            return null;
        }

        return createPortal(this.props.savedItemsCount, dest);
    }

    toggleSidebar(event) {
        event.preventDefault();
        this.setState({withSidebar: !this.state.withSidebar});
    }

    onListScroll(event) {
        const BUFFER = 10;
        const container = event.target;

        if (container !== this.elemList && !this.elemList.contains(container)) {
            // Not scrolled on the actual list
            return;
        }

        if (container.scrollTop + container.offsetHeight + BUFFER >= container.scrollHeight) {
            this.props.fetchMoreItems()
                .catch(() => null); // ignore
        }

        if(container.scrollTop > BUFFER) {
            this.setState({ scrollClass: 'wire-column__main-header--small'});
        }
        else {
            this.setState({ scrollClass: ''});
        }
    }

    filterActions(item, config) {
        return this.props.actions.filter((action) => (!config || isDisplayed(action.id, config)) &&
          (!action.when || action.when(this.props.state, item)));
    }

    componentDidMount() {
        this.initTooltips();
    }

    initTooltips() {
        if ( !isTouchDevice() ) {
            this.elemOpen && $(this.elemOpen).tooltip();
            this.elemClose && $(this.elemClose).tooltip();
        }
    }

    disposeTooltips() {
        this.elemOpen && $(this.elemOpen).tooltip('dispose');
        this.elemClose && $(this.elemClose).tooltip('dispose');
    }

    componentWillUnmount() {
        this.disposeTooltips();
    }

    getSnapshotBeforeUpdate() {
        this.disposeTooltips();
        return null;
    }

    componentDidUpdate(nextProps) {
        if ((nextProps.activeQuery || this.props.activeQuery) && (nextProps.activeQuery !== this.props.activeQuery)) {
            this.elemList.scrollTop = 0;
        }
        this.initTooltips();
    }
}

BaseApp.propTypes = {
    state: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeQuery: PropTypes.string,
    fetchMoreItems: PropTypes.func.isRequired,
    savedItemsCount: PropTypes.number,
};
