import React from 'react';
import PropTypes from 'prop-types';


class ActionButton extends React.Component {
    componentDidMount() {
        $(this.elem).tooltip();
    }

    componentWillUnmount() {
        $(this.elem).tooltip('dispose'); // make sure it's gone
    }

    render() {
        return (
            <button
                type='button'
                className={this.props.className}
                onClick={() => this.props.action.action(this.props.action.multi ? [this.props.item._id] : this.props.item)}
                ref={(elem) => this.elem = elem}
                title={!this.props.displayName && this.props.action.name}>
                <i className={`icon--${this.props.action.icon}`}></i>
                {this.props.displayName && this.props.action.name}</button>
        );
    }
}

ActionButton.propTypes = {
    item: PropTypes.object,
    className: PropTypes.string,
    displayName: PropTypes.bool,
    action: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        multi: PropTypes.bool,
    })
};

export default ActionButton;
