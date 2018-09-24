import React from 'react';
import PropTypes from 'prop-types';
import {chunk} from 'lodash';
import CardRow from 'home/components/CardRow';
import NavigationCard from './NavigationCard';
import {gettext} from 'utils';


function NavigationCardsList({navigations, onNavigationClick}) {
    const cards = navigations.map((nav) => <NavigationCard
        navigation={nav}
        key={nav._id}
        onClickHandler={onNavigationClick}/>);

    const chunkCards = chunk(cards, 4).map(
        (chunk, index) => (<CardRow moreNews={false} key={index}>{chunk}</CardRow>)
    );

    return (
        <section className="content-main d-block py-4 px-2 p-md-3 p-lg-4">
            <div className="container-fluid">
                {chunkCards.length > 0 && chunkCards}
                {chunkCards.length === 0 &&
                    <div className="alert alert-warning" role="alert">
                        <strong>{gettext('Warning')}!</strong> {gettext('There\'s no navigations defined!')}
                    </div>
                }
            </div>
        </section>
    );
}

NavigationCardsList.propTypes = {
    navigations: PropTypes.array,
    onNavigationClick: PropTypes.func,
};

export default NavigationCardsList;
