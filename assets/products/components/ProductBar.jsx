import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import SearchBar from 'wire/components/SearchBar';

class ProductBar extends React.Component {
    render() {
        return (
            <section className="content-header">
                <nav className="content-bar navbar content-bar--side-padding">
                    <SearchBar setQuery={this.props.setQuery} fetchItems={()=>this.props.fetchProducts()}/>
                    <div className="content-bar__right">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => this.props.onNewProduct('products')}>{gettext('New Product')}</button>
                    </div>
                </nav>
            </section>
        );
    }
}

ProductBar.propTypes = {
    query: PropTypes.string,
    setQuery: PropTypes.func,
    fetchProducts: PropTypes.func,
    state: PropTypes.object,
    onNewProduct: PropTypes.func,
};


export default ProductBar;