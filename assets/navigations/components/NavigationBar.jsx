import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from 'wire/components/SearchBar';

class NavigationBar extends React.Component {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    <SearchBar setQuery={this.props.setQuery} fetchItems={()=>this.props.fetchNavigations()}/>
                    <div className="content-bar__right">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => this.props.onNewNavigation()}>{gettext('New Navigation')}</button>
                    </div>
                </nav>
            </section>
        );
    }
}

NavigationBar.propTypes = {
    query: PropTypes.string,
    setQuery: PropTypes.func,
    fetchNavigations: PropTypes.func,
    state: PropTypes.object,
    onNewNavigation: PropTypes.func,
};


export default NavigationBar;