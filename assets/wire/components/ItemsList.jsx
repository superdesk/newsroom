import React from 'react';
import PropTypes from 'prop-types';

import WireListItem from './WireListItem';

function ItemsList({items, onClick}) {
    const articles = items.map((item) =>
        <WireListItem key={item._id} item={item} onClick={onClick} />
    );

    return <div className="col">{articles}</div>;
}

ItemsList.propTypes = {
    items: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
};

export default ItemsList;
