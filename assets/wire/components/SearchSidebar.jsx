import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { setActiveFilterTab, getActiveFilterTab } from 'local-store';

class SearchSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {active: getActiveFilterTab(props.props.context) || props.tabs[0].id};
    }

    render() {
        return (
            <div className='wire-column__nav__items'>
                <ul className='nav justify-content-center' id='pills-tab' role='tablist'>
                    {this.props.tabs.map((tab) => (
                        <li className='wire-column__nav__tab nav-item' key={tab.id}>
                            <a className={`nav-link ${this.state.active === tab.id && 'active'}`}
                                role='tab'
                                href=''
                                onClick={(event) => {
                                    event.preventDefault();
                                    setActiveFilterTab(tab.id, this.props.props.context);
                                    this.setState({active: tab.id});
                                }}>{tab.label}</a>
                        </li>
                    ))}
                </ul>
                {this.props.tabs.map((tab) => (
                    <div className='tab-content' key={tab.id}>
                        <div className={classNames('tab-pane', 'fade', {'show active': this.state.active === tab.id})} role='tabpanel'>
                            <tab.component {...this.props.props} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

SearchSidebar.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        component: PropTypes.func.isRequired,
    })),
    props: PropTypes.object,
};

export default SearchSidebar;
