import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from 'search/components/SearchBar';

class ListBar extends React.Component {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    {this.props.children}
                    {!this.props.noSearch && (
                        <SearchBar
                            setQuery={this.props.setQuery}
                            fetchItems={() => this.props.fetch()}
                        />
                    )}
                    <div className="content-bar__right">
                        {this.props.onNewItem && <button
                            className="btn btn-outline-secondary btn-responsive"
                            onClick={() => this.props.onNewItem()}>
                            {gettext('New {{ buttonName }}', {buttonName: this.props.buttonName})}
                        </button>}
                    </div>
                </nav>
            </section>
        );
    }
}

ListBar.propTypes = {
    setQuery: PropTypes.func,
    fetch: PropTypes.func,
    buttonName: PropTypes.string,
    onNewItem: PropTypes.func,
    children: PropTypes.node,
    noSearch: PropTypes.bool,
};

export default ListBar;
