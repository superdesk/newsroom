import {get, memoize} from 'lodash';

import ConfigEvent from 'components/cards/edit/ConfigEvent';
import ConfigExternalMedia from 'components/cards/edit/ConfigExternalMedia';
import ConfigNavigation from 'components/cards/edit/ConfigNavigation';
import ConfigProduct from 'components/cards/edit/ConfigProduct';

import TextOnlyCard from 'components/cards/render/TextOnlyCard';
import PictureTextCard from 'components/cards/render/PictureTextCard';
import MediaGalleryCard from 'components/cards/render/MediaGalleryCard';
import PhotoGalleryCard from 'components/cards/render/PhotoGalleryCard';
import TopNewsOneByOneCard from 'components/cards/render/TopNewsOneByOneCard';
import LargeTextOnlyCard from 'components/cards/render/LargeTextOnlyCard';
import LargePictureTextCard from 'components/cards/render/LargePictureTextCard';
import EventsTwoByTwoCard from 'components/cards/render/EventsTwoByTwoCard';
import NavigationSixPerRow from 'components/cards/render/NavigationSixPerRow';
import {gettext} from 'utils';


const CARD_TYPES = [
    {
        _id: '6-text-only',
        text: gettext('6-text-only'),
        editComponent: ConfigProduct,
        dashboardComponent: TextOnlyCard,
        dashboard: ['newsroom'],
        size: 6,
    },
    {
        _id: '4-picture-text',
        text: gettext('4-picture-text'),
        editComponent: ConfigProduct,
        dashboardComponent: PictureTextCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '4-media-gallery',
        text: gettext('4-media-gallery'),
        editComponent: ConfigProduct,
        dashboardComponent: MediaGalleryCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '4-photo-gallery',
        text: gettext('4-photo-gallery'),
        editComponent: ConfigExternalMedia,
        dashboardComponent: PhotoGalleryCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '1x1-top-news',
        text: gettext('1x1-top-news'),
        editComponent: ConfigProduct,
        dashboardComponent: TopNewsOneByOneCard,
        dashboard: ['newsroom'],
        size: 2,
    },
    {
        _id: '2x2-top-news',
        text: gettext('2x2-top-news'),
        editComponent: ConfigProduct,
        dashboardComponent: TopNewsOneByOneCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '3-text-only',
        text: gettext('3-text-only'),
        editComponent: ConfigProduct,
        dashboardComponent: LargeTextOnlyCard,
        dashboard: ['newsroom'],
        size: 3,
    },
    {
        _id: '3-picture-text',
        text: gettext('3-picture-text'),
        editComponent: ConfigProduct,
        dashboardComponent: LargePictureTextCard,
        dashboard: ['newsroom'],
        size: 3,
    },
    {
        _id: '4-text-only',
        text: gettext('4-text-only'),
        editComponent: ConfigProduct,
        dashboardComponent: PictureTextCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '2x2-events',
        text: gettext('2x2-events'),
        editComponent: ConfigEvent,
        dashboardComponent: EventsTwoByTwoCard,
        dashboard: ['newsroom'],
        size: 4,
    },
    {
        _id: '6-navigation-row',
        text: gettext('6 Navigation Tiles Per Row'),
        editComponent: ConfigNavigation,
        dashboardComponent: NavigationSixPerRow,
        dashboard: ['newsroom', 'market_place'],
        size: 6,
    }
];

const getCard = memoize((cardId) => CARD_TYPES.find((card) => card._id === cardId));
const getCardEditComponent = (cardId) => get(getCard(cardId), 'editComponent', ConfigProduct);
const getCardDashboardComponent = (cardId) => get(getCard(cardId), 'dashboardComponent');

export {
    CARD_TYPES,
    getCard,
    getCardEditComponent,
    getCardDashboardComponent
};