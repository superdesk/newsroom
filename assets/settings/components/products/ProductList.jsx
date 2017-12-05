import React from 'react';
import PropTypes from 'prop-types';
import ProductListItem from './ProductListItem';
import { gettext } from 'utils';


function ProductList({products, onClick, activeProductId}) {
    const list = products.map((product) =>
        <ProductListItem
            key={product._id}
            product={product}
            onClick={onClick}
            isActive={activeProductId===product._id}/>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Name') }</th>
                            <th>{ gettext('Status') }</th>
                            <th>{ gettext('Type') }</th>
                            <th>{ gettext('Created On') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

ProductList.propTypes = {
    products: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeProductId: PropTypes.string
};

export default ProductList;
