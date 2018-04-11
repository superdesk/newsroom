import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';

import { EXTENDED_VIEW, COMPACT_VIEW } from '../defaults';
import {isTouchDevice} from '../../utils';

class ListViewControls extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {isOpen: false};
        this.views = [
            {type: EXTENDED_VIEW, label: gettext('Large list')},
            {type: COMPACT_VIEW, label: gettext('Compact list')},
            //{type: 'grid', label: gettext('Grid')},
        ];

        this.toggleOpen = this.toggleOpen.bind(this);
    }

    toggleOpen() {
        this.setState({isOpen: !this.state.isOpen});
    }

    setView(view) {
        this.setState({isOpen: false});
        this.props.setView(view.type);
    }

    componentDidMount() {
        if ( !isTouchDevice() ) {
            this.elem && $(this.elem).tooltip();
        }
    }

    componentWillUnmount() {
        this.elem && $(this.elem).tooltip('dispose'); // make sure it's gone
    }

    render() {
        return(
            <div className='content-bar__right'>
                <div className='btn-group'>
                    <span
                        className='content-bar__menu'
                        onClick={this.toggleOpen}
                        ref={(elem) => this.elem = elem}
                        title={gettext('Change view')}>
                        <i className={`icon--${this.props.activeView}`}></i>
                    </span>
                    {this.state.isOpen && (
                        <div className='dropdown-menu dropdown-menu-right show'>
                            <h6 className='dropdown-header'>{gettext('Change view')}</h6>
                            {this.views.map((view) => (
                                <button key={view.type}
                                    className='dropdown-item'
                                    onClick={() => this.setView(view)}
                                    type='button'>
                                    <i className={`icon--${view.type}`} />
                                    {' '}{view.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

ListViewControls.propTypes = {
    activeView: PropTypes.string,
    setView: PropTypes.func.isRequired,
};

export default ListViewControls;
