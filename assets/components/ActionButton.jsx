import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isTouchDevice } from 'utils';


class ActionButton extends React.Component {
    componentDidMount() {
        if ( !isTouchDevice() ) {
            this.elem && $(this.elem).tooltip({ trigger: 'hover' });
        }
    }

    componentWillUnmount() {
        this.elem && $(this.elem).tooltip('dispose'); // make sure it's gone
    }

    render() {
        const classes = classNames(`icon--${this.props.action.icon}`, {
            'icon--gray': this.props.isVisited,
        });
        return (
            <button
                type='button'
                className={this.props.className}
                onClick={() => this.props.action.action(this.props.action.multi ? [this.props.item._id] : this.props.item)}
                ref={(elem) => this.elem = elem}
                title={!this.props.displayName ? this.props.action.name : ''}>
                <i className={classes}></i>
                {this.props.displayName && this.props.action.name}</button>
        );
    }
}

ActionButton.propTypes = {
    item: PropTypes.object,
    className: PropTypes.string,
    displayName: PropTypes.bool,
    isVisited: PropTypes.bool,
    action: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        multi: PropTypes.bool,
    })
};

export default ActionButton;