import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {gettext} from 'utils';
import { get } from 'lodash';
import TextOnlyCard from './TextOnlyCard';
import PictureTextCard from './PictureTextCard';
import MediaGalleryCard from './MediaGalleryCard';
import TopNewsOneByOneCard from './TopNewsOneByOneCard';
import TopNewsTwoByTwoCard from './TopNewsTwoByTwoCard';
import LargeTextOnlyCard from './LargeTextOnlyCard';
import LargePictureTextCard from './LargePictureTextCard';
import {getItemActions} from 'wire/item-actions';
import ItemDetails from 'wire/components/ItemDetails';
import {openItemDetails, setActive} from '../actions';
import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import DownloadItemsModal from 'wire/components/DownloadItemsModal';
import PhotoGalleryCard from './PhotoGalleryCard';
import EventsTwoByTwoCard from './EventsTwoByTwoCard';

const panels = {
    '6-text-only': TextOnlyCard,
    '4-picture-text': PictureTextCard,
    '4-media-gallery': MediaGalleryCard,
    '4-photo-gallery': PhotoGalleryCard,
    '1x1-top-news': TopNewsOneByOneCard,
    '2x2-top-news': TopNewsTwoByTwoCard,
    '3-text-only': LargeTextOnlyCard,
    '3-picture-text': LargePictureTextCard,
    '4-text-only': PictureTextCard,
    '2x2-events': EventsTwoByTwoCard,
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
        this.onHomeScroll = this.onHomeScroll.bind(this);
        this.height = 0;
    }

    componentDidMount() {
        document.getElementById('footer').className = 'footer footer--home';
        this.height = this.elem.offsetHeight;
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return (
                <Modal key="modal" data={specs.data} />
            );
        }
    }

    onHomeScroll(event) {
        const container = event.target;
        const BUFFER = 100;
        if(container.scrollTop + this.height + BUFFER >= container.scrollHeight) {
            document.getElementById('footer').className = 'footer';
        } else {
            document.getElementById('footer').className = 'footer footer--home';
        }
    }

    getProduct(card) {
        return this.props.products.find(p => p._id === card.config.product);
    }

    getPanels(card) {
        const Panel = panels[card.type];
        if (card.type === '4-photo-gallery') {
            return <Panel
                key={card.label}
                photos={this.props.photos}
                title={card.label}
            />;
        }
        if (card.type === '2x2-events') {
            return <Panel
                key={card.label}
                events={get(card, 'config.events')}
                title={card.label}
            />;
        }

        const items = this.props.itemsByCard[card.label] || [];
        return <Panel
            key={card.label}
            type={card.type}
            items={items}
            title={card.label}
            product={this.getProduct(card)}
            openItem={this.props.openItemDetails}
            isActive={this.props.activeCard === card._id}
            cardId={card._id}
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
                <section className="content-main d-block py-4 px-2 p-md-3 p-lg-4"
                    onScroll={this.onHomeScroll}
                    ref={(elem) => this.elem = elem}
                >
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
    photos: PropTypes.array,
    cards: PropTypes.arrayOf(PropTypes.object),
    itemsByCard: PropTypes.object,
    products: PropTypes.array,
    user: PropTypes.string,
    company: PropTypes.string,
    format: PropTypes.array,
    itemToOpen: PropTypes.object,
    modal: PropTypes.object,
    openItemDetails: PropTypes.func,
    activeCard: PropTypes.string,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
};

const mapStateToProps = (state) => ({
    photos: state.photos,
    cards: state.cards,
    itemsByCard: state.itemsByCard,
    products: state.products,
    user: state.user,
    company: state.company,
    format: PropTypes.format,
    itemToOpen: state.itemToOpen,
    modal: state.modal,
    activeCard: state.activeCard,
});

const mapDispatchToProps = (dispatch) => ({
    openItemDetails: (item, cardId) => {
        dispatch(openItemDetails(item));
        dispatch(setActive(cardId));
    },
    actions: getItemActions(dispatch),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomeApp);