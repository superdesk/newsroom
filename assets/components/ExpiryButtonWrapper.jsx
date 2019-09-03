import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class ExpiryButtonWrapper extends React.PureComponent {
    render() {
        return (
            <button
                onClick={this.props.onClick}
                className={classNames(
                    'expiry-date__date-input btn align-items-center px-2 btn-with-icon btn-outline-secondary',
                    {'active': this.props.active}
                )}
                disabled={this.props.disabled}
            >
                {this.props.value}
                <i className={classNames('icon-small--arrow-down icon--gray ml-1', {'icon--white': this.props.active})}/>
            </button>
        );
    }
}

ExpiryButtonWrapper.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    disabled: PropTypes.bool,
    active: PropTypes.bool,
};
