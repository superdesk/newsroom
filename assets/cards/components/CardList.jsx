import React from 'react';
import PropTypes from 'prop-types';
import CardListItem from './CardListItem';
import { gettext } from 'utils';


function CardList({cards, products, onClick, activeCardId}) {
    const list = cards.map((card) =>
        <CardListItem
            key={card._id}
            products={products}
            card={card}
            onClick={onClick}
            isActive={activeCardId===card._id}/>
    );

    return (
        <section className="content-main">
            <div className="list-items-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>{ gettext('Label') }</th>
                            <th>{ gettext('Type') }</th>
                            <th>{ gettext('Product') }</th>
                            <th>{ gettext('Order') }</th>
                            <th>{ gettext('Created On') }</th>
                        </tr>
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        </section>
    );
}

CardList.propTypes = {
    cards: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeCardId: PropTypes.string
};

export default CardList;