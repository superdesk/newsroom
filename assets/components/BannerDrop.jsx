import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class BannerDrop extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: this.props.isOpen };
        this.toggleOpen = this.toggleOpen.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.open !== nextProps.isOpen) {
            this.setState({ open: nextProps.isOpen });
        }
    }

    toggleOpen() {
        this.setState({ open: !this.state.open});
    }

    render() {
        return (<div className="banner-drop">
            <div className={classNames('banner-drop__child',
                {'banner-drop__child--active': this.state.open})}>
                {this.props.children}
            </div>
            {this.props.label && <div className={classNames('banner-drop__text', 'pl-5', 'ml-5',
                {'banner-drop__text--active': this.state.open})}>{this.props.label}</div>}
            <div className="banner-drop__toggle">
                <div className="banner-drop__line banner-drop__line--left" />
                <button type="button" className={classNames({'active': this.state.open})}>
                    <i className="banner-drop__toggle icon-small--arrow-down" onClick={this.toggleOpen} />
                </button>
                <div className="banner-drop__line banner-drop__line--right" />
            </div>
        </div>);
    }
}

BannerDrop.propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    isOpen: PropTypes.bool,
};

export default BannerDrop;
