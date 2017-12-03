import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EditProduct from './EditProduct';
import ProductList from './ProductList';
import SearchResultsInfo from 'wire/components/SearchResultsInfo';
import {setError, saveCompanies, fetchCompanies} from 'settings/actions';
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

        this.props.saveProduct('products');
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
                        companies={this.props.companies}
                        saveCompanies={this.props.saveCompanies}
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
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    companies: PropTypes.arrayOf(PropTypes.object),
    saveCompanies: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    companies: state.companies,
});

const mapDispatchToProps = (dispatch) => ({
    saveCompanies: (companies) => dispatch(saveCompanies(companies)),
    fetchCompanies: () => dispatch(fetchCompanies()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Products);
