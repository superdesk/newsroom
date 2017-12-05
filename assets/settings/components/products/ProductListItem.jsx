import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';


function ProductListItem({product, isActive, onClick}) {
    return (
        <tr key={product._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(product._id)}>
            <td className="name">{product.name}</td>
            <td>{(product.is_enabled ? gettext('Enabled') : gettext('Disabled'))}</td>
            <td>{gettext(product.product_type)}</td>
            <td>{shortDate(product._created)}</td>
        </tr>
    );
}

ProductListItem.propTypes = {
    company: PropTypes.object,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default ProductListItem;
