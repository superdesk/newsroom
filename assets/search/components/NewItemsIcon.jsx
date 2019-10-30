import React from 'react';
import PropTypes from 'prop-types';
import 'react-toggle/style.css';
import {get} from 'lodash';

import {gettext, isTouchDevice, isWireContext} from 'utils';

class NewItemsIcon extends React.Component {
    constructor(props) {
        super(props);

        this.dom = {tooltip: null};
    }

    componentDidMount() {
        if (!isTouchDevice() && this.dom.tooltip) {
            $(this.dom.tooltip).tooltip();
        }
    }

    componentWillUnmount() {
        if (this.dom.tooltip) {
            $(this.dom.tooltip).tooltip('dispose'); // make sure it's gone
        }
    }

    componentWillUpdate() {
        this.componentWillUnmount();
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    render() {
        const newItemsLength = get(this.props, 'newItems.length', 0) > 25 ?
            '25+' :
            get(this.props, 'newItems.length');

        const newItemsTooltip = !isWireContext() ?
            gettext('New events to load') :
            gettext('New stories available to load');

        return (
            <button
                type="button"
                ref={(elem) => this.dom.tooltip = elem}
                title={newItemsTooltip}
                className="button__reset-styles d-flex align-items-center ml-3"
                onClick={this.props.refresh}
            >
                <i className="icon--refresh icon--pink"/>
                <span className="badge badge-pill badge-info badge-secondary ml-2">
                    {newItemsLength}
                </span>
            </button>
        );
    }
}

NewItemsIcon.propTypes = {
    newItems: PropTypes.array,
    refresh: PropTypes.func,
};

export default NewItemsIcon;
