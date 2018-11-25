import React from 'react';
import PropTypes from 'prop-types';
import SelectInput from 'components/SelectInput';

import { gettext } from 'utils';


class ConfigProduct extends React.Component {
    constructor(props) {
        super(props);

        this.getProducts = this.getProducts.bind(this);
    }

    getProducts() {
        const productList = [{ value: '', text: '' }];
        this.props.products.map((product) => {
            productList.push({ value: product._id, text: product.name });
        });
        return productList;
    }

    render() {
        return (
            <SelectInput
                key='product'
                name='product'
                label={gettext('Product')}
                value={this.props.card.config.product}
                options={this.getProducts()}
                onChange={this.props.onChange}
                error={this.props.errors ? this.props.errors.product : null} />
        );
    }
}

ConfigProduct.propTypes = {
    card: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object),
};

export default ConfigProduct;