import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditProduct from './EditProduct';
import ProductList from './ProductList';
import SearchResultsInfo from 'wire/components/SearchResultsInfo';
import {
    setError,
    saveCompanies,
    fetchCompanies,
    fetchNavigations,
    saveNavigations,
    postProduct,
    editProduct,
    selectProduct,
    deleteProduct,
    newProduct,
    cancelEdit
} from '../actions';
import {gettext} from 'utils';

class Products extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.productToEdit.name) {
            errors.name = ['Please provide product name'];
            valid = false;
        }

        this.props.dispatch(setError(errors));
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveProduct();
    }

    deleteProduct(event) {
        event.preventDefault();

        if (confirm(gettext('Would you like to delete product: {{name}}', {name: this.props.productToEdit.name}))) {
            this.props.deleteProduct();
        }
    }

    render() {
        const progressStyle = {width: '25%'};

        return (
            <div className="flex-row">
                {(this.props.isLoading ?
                    <div className="col d">
                        <div className="progress">
                            <div className="progress-bar" style={progressStyle} />
                        </div>
                    </div>
                    :
                    <div className="flex-col">
                        {this.props.activeQuery &&
                        <SearchResultsInfo
                            totalItems={this.props.totalProducts}
                            query={this.props.activeQuery} />
                        }
                        <ProductList
                            products={this.props.products}
                            onClick={this.props.selectProduct}
                            activeProductId={this.props.activeProductId} />
                    </div>
                )}
                {this.props.productToEdit &&
                    <EditProduct
                        product={this.props.productToEdit}
                        onChange={this.props.editProduct}
                        errors={this.props.errors}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteProduct}
                        fetchCompanies={this.props.fetchCompanies}
                        fetchNavigations={this.props.fetchNavigations}
                        companies={this.props.companies}
                        navigations={this.props.navigations}
                        saveCompanies={this.props.saveCompanies}
                        saveNavigations={this.props.saveNavigations}
                    />
                }
            </div>
        );
    }
}

Products.propTypes = {
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
    fetchCompanies: PropTypes.func,
    fetchNavigations: PropTypes.func,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    companies: PropTypes.arrayOf(PropTypes.object),
    navigations: PropTypes.arrayOf(PropTypes.object),
    saveCompanies: PropTypes.func.isRequired,
    saveNavigations: PropTypes.func.isRequired,
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
    saveCompanies: (companies) => dispatch(saveCompanies(companies)),
    fetchCompanies: () => dispatch(fetchCompanies()),
    saveNavigations: (navigations) => dispatch(saveNavigations(navigations)),
    fetchNavigations: () => dispatch(fetchNavigations()),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Products);