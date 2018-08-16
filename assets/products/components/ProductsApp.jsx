import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    newProduct,
    setQuery,
    fetchProducts,
    selectSection,
} from '../actions';
import Products from './Products';
import ListBar from 'components/ListBar';
import SectionSwitch from './SectionSwitch';
import { gettext } from 'utils';

import { sectionsPropType } from '../types';

class ProductsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div>
                <ListBar
                    onNewItem={this.props.newProduct}
                    setQuery={this.props.setQuery}
                    fetch={this.props.fetchProducts}
                    buttonName={gettext('Product')}
                >
                    <SectionSwitch
                        sections={this.props.sections}
                        activeSection={this.props.activeSection}
                        selectSection={this.props.selectSection}
                    />
                </ListBar>
                <Products activeSection={this.props.activeSection} sections={this.props.sections} />
            </div>
        );
    }
}

ProductsApp.propTypes = {
    sections: sectionsPropType,
    activeSection: PropTypes.string.isRequired,

    fetchProducts: PropTypes.func,
    setQuery: PropTypes.func,
    newProduct: PropTypes.func,
    selectSection: PropTypes.func,
};

const mapStateToProps = (state) => ({
    sections: state.sections.list,
    activeSection: state.sections.active,
});

const mapDispatchToProps = {
    fetchProducts,
    setQuery,
    newProduct,
    selectSection,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsApp);
