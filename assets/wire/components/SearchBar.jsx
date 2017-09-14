import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { gettext } from '../utils';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="navbar sticky-top navbar-light bg-light">
                <form className="form-inline">
                    <input type="text"
                        name="q"
                        className="form-control mr-sm-2"
                        defaultValue={this.props.query}
                    />
                    <button className="btn btn-outline-success my-2 my-sm-0"
                        type="submit">{gettext('Search')}</button>
                </form>
            </nav>
        );
    }
}

SearchBar.propTypes = {
    query: PropTypes.string,
};

const mapStateToProps = (state) => ({
    query: state.query,
});

export default connect(mapStateToProps, null)(SearchBar);
