import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import NavigationCard from './NavigationCard';


function NavigationSixPerRow({card, onNavigationClick}) {
    const navigations = get(card, 'config.navigations') || [];

    const cards = navigations.map((nav) => <NavigationCard
        navigation={nav}
        key={nav._id}
        onClickHandler={onNavigationClick}/>);

    if (get(cards, 'length', 0) === 0) {
        return null;
    }

    return (
        <div className="row">
            <div className="col-12 col-sm-12">
                <h3 className="home-section-heading">{card.label}</h3>
            </div>
            {cards}
        </div>
    );
}

NavigationSixPerRow.propTypes = {
    card: PropTypes.object.isRequired,
    onNavigationClick: PropTypes.func,
};

export default NavigationSixPerRow;
