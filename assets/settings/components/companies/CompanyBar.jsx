import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from '../../../wire/components/SearchBar';

class CompanyBar extends React.Component {
    render() {
        return (
            <nav className="navbar sticky-top navbar-light bg-light">
                <SearchBar />
                <button
                    className="btn btn-primary btn-lg active float-right"
                    onClick={() => this.props.onNewCompany('companies')}>{gettext('New Company')}</button>
            </nav>
        );
    }
}

CompanyBar.propTypes = {
    query: PropTypes.string,
    setQuery: PropTypes.func,
    fetchItems: PropTypes.func,
    state: PropTypes.object,
    onNewCompany: PropTypes.func,
};


export default CompanyBar;
