import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from 'wire/components/SearchBar';

class CompanyBar extends React.Component {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    <SearchBar setQuery={this.props.setQuery} fetchItems={()=>this.props.fetchItems('companies')}/>
                    <div className="content-bar__right">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => this.props.onNewCompany('companies')}>{gettext('New Company')}</button>
                    </div>
                </nav>
            </section>
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
