import React from 'react';
import PropTypes from 'prop-types';
import { shortDate } from 'utils';


function getProductName(products, id) {
    if (id) {
        return products.filter((product) => product._id == id)[0].name;
    }
}

function CardListItem({card, products, isActive, onClick}) {
    return (
        <tr key={card._id}
            className={isActive?'table--selected':null}
            onClick={() => onClick(card._id)}>
            <td className="name">{card.label}</td>
            <td>{card.type}</td>
            <td>{getProductName(products, card.config.product)}</td>
            <td>{card.order}</td>
            <td>{shortDate(card._created)}</td>
        </tr>
    );
}

CardListItem.propTypes = {
    card: PropTypes.object,
    products: PropTypes.array,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
};

export default CardListItem;