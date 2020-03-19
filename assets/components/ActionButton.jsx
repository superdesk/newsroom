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
        const {item, group, plan, action, disabled} = this.props;

        return (
            <button
                type='button'
                className={this.props.className}
                disabled={disabled}
                onClick={
                    () => {
                        if (action.multi) {
                            return action.action([item._id]);
                        } else {
                            return action.action(item, group, plan);
                        }
                    }
                }
                ref={(elem) => this.elem = elem}
                title={!this.props.displayName ? this.props.action.tooltip || this.props.action.name : ''}>
                <i className={classes}></i>
                {this.props.displayName && this.props.action.name}</button>
        );
    }
}

ActionButton.propTypes = {
    item: PropTypes.object,
    group: PropTypes.string,
    plan: PropTypes.object,
    className: PropTypes.string,
    displayName: PropTypes.bool,
    isVisited: PropTypes.bool,
    action: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        multi: PropTypes.bool,
        tooltip: PropTypes.string,
    }),
    disabled: PropTypes.bool,
};

export default ActionButton;