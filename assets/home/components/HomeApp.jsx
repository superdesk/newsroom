import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TextOnlyCard from './TextOnlyCard';
import PictureTextCard from './PictureTextCard';
import MediaGalleryCard from './MediaGalleryCard';
import TopNewsOneByOneCard from './TopNewsOneByOneCard';
import TopNewsTwoByTwoCard from './TopNewsTwoByTwoCard';
import LargeTextOnlyCard from './LargeTextOnlyCard';
import LargePictureTextCard from './LargePictureTextCard';
import {gettext} from 'utils';
import {getItemActions} from 'wire/item-actions';
import ItemDetails from 'wire/components/ItemDetails';
import {openItemDetails} from '../actions';
import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import DownloadItemsModal from 'wire/components/DownloadItemsModal';

const panels = {
    '6-text-only': TextOnlyCard,
    '4-picture-text': PictureTextCard,
    '4-media-gallery': MediaGalleryCard,
    '1x1-top-news': TopNewsOneByOneCard,
    '2x2-top-news': TopNewsTwoByTwoCard,
    '3-text-only': LargeTextOnlyCard,
    '3-picture-text': LargePictureTextCard,
};

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
    downloadItems: DownloadItemsModal,
};

class HomeApp extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.getPanels = this.getPanels.bind(this);
        this.filterActions = this.filterActions.bind(this);
        this.renderModal = this.renderModal.bind(this);
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return (
                <Modal key="modal" data={specs.data} />
            );
        }
    }

    getProduct(card) {
        return this.props.products.find(p => p._id === card.config.product);
    }

    getPanels(card) {
        const items = this.props.itemsByCard[card.label];
        const Panel = panels[card.type];
        return <Panel
            key={card.label}
            items={items}
            title={card.label}
            product={this.getProduct(card)}
            openItem={this.props.openItemDetails}
        />;
    }

    filterActions(item) {
        return this.props.actions.filter((action) => !action.when || action.when(this.props, item));
    }

    render() {
        const modal = this.renderModal(this.props.modal);

        return (
            (this.props.itemToOpen ? [<ItemDetails key="itemDetails"
                item={this.props.itemToOpen}
                user={this.props.user}
                actions={this.filterActions(this.props.itemToOpen)}
                onClose={() => this.props.actions.filter(a => a.id == 'open')[0].action(null)}
            />, modal] :
                <section className="content-main d-block py-4 px-2 p-md-3 p-lg-4">
                    <div className="container-fluid">
                        {this.props.cards.length > 0 && this.props.cards.map((card) => this.getPanels(card))}
                        {this.props.cards.length === 0 &&
                        <div className="alert alert-warning" role="alert">
                            <strong>{gettext('Warning')}!</strong> {gettext('There\'s no card defined for home page!')}
                        </div>
                        }
                    </div>
                </section>)
        );
    }
}

HomeApp.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    itemsByCard: PropTypes.object,
    products: PropTypes.array,
    user: PropTypes.string,
    company: PropTypes.string,
    format: PropTypes.array,
    itemToOpen: PropTypes.object,
    modal: PropTypes.object,
    openItemDetails: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
};

const mapStateToProps = (state) => ({
    cards: state.cards,
    itemsByCard: state.itemsByCard,
    products: state.products,
    user: state.user,
    company: state.company,
    format: PropTypes.format,
    itemToOpen: state.itemToOpen,
    modal: state.modal,
});

const mapDispatchToProps = (dispatch) => ({
    openItemDetails: (item) => dispatch(openItemDetails(item)),
    actions: getItemActions(dispatch),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomeApp);
