import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextOnlyCard from './TextOnlyCard';
import PictureTextCard from './PictureTextCard';

const panels = {
    '6-text-only': TextOnlyCard,
    '4-picture-text': PictureTextCard,
};

class HomeApp extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.getPanels = this.getPanels.bind(this);
    }

    getPanels(card) {
        const items = this.props.itemsByCard[card.label];
        const Panel = panels[card.type];
        return <Panel key={card.label} items={items} title={card.label}/>;
    }

    render() {
        return (
            <section className="content-main d-block py-4 px-2 p-md-3 p-lg-4">
                <div className="container-fluid">
                    {this.props.cards.map((card) => this.getPanels(card))}
                </div>
            </section>
        );
    }
}

HomeApp.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    itemsByCard: PropTypes.object,
};

const mapStateToProps = (state) => ({
    cards: state.cards,
    itemsByCard: state.itemsByCard,
});


export default connect(mapStateToProps, null)(HomeApp);
