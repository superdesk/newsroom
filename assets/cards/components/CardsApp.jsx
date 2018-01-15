import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    newCard,
    setQuery,
    fetchCards,
} from '../actions';
import Cards from './Cards';
import ListBar from 'components/ListBar';


class CardsApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            [<ListBar
                key="CardBar"
                onNewItem={this.props.newCard}
                setQuery={this.props.setQuery}
                fetch={this.props.fetchCards}
                buttonName={'Card'}
            />,
            <Cards key="Cards"
            />]
        );
    }
}

CardsApp.propTypes = {
    newCard: PropTypes.func,
    fetchCards: PropTypes.func,
    setQuery: PropTypes.func,
};

const mapDispatchToProps = {
    newCard,
    fetchCards,
    setQuery,
};

export default connect(null, mapDispatchToProps)(CardsApp);
