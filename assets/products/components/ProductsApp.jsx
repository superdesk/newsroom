import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    selectProduct,
    editProduct,
    cancelEdit,
    postProduct,
    deleteProduct,
    newProduct,
    setQuery,
    fetchProducts,
} from '../actions';
import ProductBar from './ProductBar';
import Products from './Products';


class ProductsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ProductBar
                key="ProductBar"
                onNewProduct={this.props.newProduct}
                setQuery={this.props.setQuery}
                fetchProducts={this.props.fetchProducts}
            />,
            <Products
                key="Products"
                products={this.props.products}
                productToEdit={this.props.productToEdit}
                activeProductId={this.props.activeProductId}
                selectProduct={this.props.selectProduct}
                editProduct={this.props.editProduct}
                saveProduct={this.props.saveProduct}
                deleteProduct={this.props.deleteProduct}
                newProduct={this.props.newProduct}
                cancelEdit={this.props.cancelEdit}
                isLoading={this.props.isLoading}
                activeQuery={this.props.activeQuery}
                totalProducts={this.props.totalProducts}
                companies={this.props.companies}
                companiesById={this.props.companiesById}
                errors={this.props.errors}
                dispatch={this.props.dispatch}

            />]
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

const mapStateToProps = (state) => ({
    products: state.products.map((id) => state.productsById[id]),
    productToEdit: state.productToEdit,
    activeProductId: state.activeProductId,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalProducts: state.totalProducts,
    companies: state.companies,
    companiesById: state.companiesById,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectProduct: (_id) => dispatch(selectProduct(_id)),
    editProduct: (event) => dispatch(editProduct(event)),
    saveProduct: (type) => dispatch(postProduct(type)),
    deleteProduct: (type) => dispatch(deleteProduct(type)),
    newProduct: () => dispatch(newProduct()),
    fetchProducts: () => dispatch(fetchProducts()),
    setQuery: (query) => dispatch(setQuery(query)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsApp);
