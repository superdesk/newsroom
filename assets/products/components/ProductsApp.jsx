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
import { gettext } from 'utils';

import SectionSwitch from 'features/sections/SectionSwitch';
import { sectionsPropType } from 'features/sections/types';

class ProductsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return [
            <ListBar key="bar"
                onNewItem={this.props.newProduct}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchProducts}
                buttonName={gettext('Product')}
            >
                <SectionSwitch
                    sections={this.props.sections}
                    activeSection={this.props.activeSection}
                />
            </ListBar>,
            <Products key="products" activeSection={this.props.activeSection} sections={this.props.sections} />
        ];
    }
}

ProductsApp.propTypes = {
    sections: sectionsPropType,
    activeSection: PropTypes.string.isRequired,

    fetchProducts: PropTypes.func,
    setQuery: PropTypes.func,
    newProduct: PropTypes.func,
};

const mapStateToProps = (state) => ({
    sections: state.sections.list,
    activeSection: state.sections.active,
});

const mapDispatchToProps = {
    fetchProducts,
    setQuery,
    newProduct,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsApp);
