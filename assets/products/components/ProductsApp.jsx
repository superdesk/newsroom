import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    newProduct,
    setQuery,
    fetchProducts,
} from '../actions';
import Products from './Products';
import ListBar from 'components/ListBar';


class ProductsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="ProductBar"
                onNewItem={this.props.newProduct}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchProducts}
                buttonName={'Product'}
            />,
            <Products key="Products" />
            ]
        );
    }
}

ProductsApp.propTypes = {
    products: PropTypes.arrayOf(PropTypes.object),
    productToEdit: PropTypes.object,
    activeProductId: PropTypes.string,
    selectProduct: PropTypes.func,
    editProduct: PropTypes.func,
    saveProduct: PropTypes.func,
    deleteProduct: PropTypes.func,
    newProduct: PropTypes.func,
    cancelEdit: PropTypes.func,
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalProducts: PropTypes.number,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    productsById: PropTypes.object,
    fetchProducts: PropTypes.func,
    setQuery: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
};

const mapDispatchToProps = {
    fetchProducts,
    setQuery,
    newProduct,
};

export default connect(null, mapDispatchToProps)(ProductsApp);
