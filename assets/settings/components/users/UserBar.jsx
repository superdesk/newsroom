import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from 'wire/components/SearchBar';

class UserBar extends React.Component {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    <SearchBar fetchItems={()=>this.props.fetchItems('users')}/>
                    <div className="content-bar__right">
                        <button
                            className="wire-button"
                            onClick={() => this.props.onNewUser('users')}>{gettext('New User')}</button>
                    </div>
                </nav>
            </section>
        );
    }
}

UserBar.propTypes = {
    query: PropTypes.string,
    setQuery: PropTypes.func,
    fetchItems: PropTypes.func,
    state: PropTypes.object,
    onNewUser: PropTypes.func,
};


export default UserBar;
