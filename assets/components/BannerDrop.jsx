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
        if (this.props.id !== nextProps.id &&
                this.state.open !== nextProps.isOpen) {
            this.setState({ open: nextProps.isOpen });
        }
    }

    toggleOpen() {
        this.setState({ open: !this.state.open});
    }

    render() {
        const label = this.state.open ? this.props.labelOpened : this.props.labelCollapsed;
        return (<div className="banner-drop">
            <div className={classNames('banner-drop__child',
                {'banner-drop__child--active': this.state.open})}>
                {this.props.children}
            </div>
            <div className="banner-drop__toggle">
                <div className="banner-drop__line banner-drop__line--left" />
                <button type="button" className={classNames({'active': this.state.open})}>
                    <i className="banner-drop__toggle icon-small--arrow-down" onClick={this.toggleOpen} />
                </button>
                <div className="banner-drop__line banner-drop__line--right" />
            </div>
            <div className={classNames('banner-drop__text',
                {'banner-drop__text--active': this.state.open})}>{label}</div>
        </div>);
    }
}

BannerDrop.propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    labelCollapsed: PropTypes.string,
    labelOpened: PropTypes.string,
};

export default BannerDrop;
