import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextOnlyCard from './TextOnlyCard';
import PictureTextCard from './PictureTextCard';
import { gettext } from 'utils';

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
                    {this.props.cards.length > 0 && this.props.cards.map((card) => this.getPanels(card))}
                    {this.props.cards.length === 0 &&
                        <div className="alert alert-warning" role="alert">
                            <strong>{gettext('Warning')}!</strong> {gettext('There\'s no card defined for home page!')}
                        </div>
                    }
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
