import {get, keyBy} from 'lodash';
import {INIT_DATA} from './actions';

const initialState = {
    cards: [],
    navigations: []
};


export default function marketPlaceHomeReducer(state = initialState, action) {
    if (action.type === INIT_DATA) {
        // map the navigation id to navigation object
        const navigationById = keyBy(action.data.navigations|| [], '_id');
        (action.data.cards || []).forEach((card) => {
            card.config.navigations = (get(card, 'config.navigations') || [])
                .map((nav) => {
                    const navigation = get(navigationById, nav);
                    if (!navigation) {
                        // company does not have permission for navigation
                        return null;
                    }
                    navigation.href = `/market_place/?navigation=${navigation._id}`;
                    return navigation;
                }).filter((nav) => nav);
        });
        return {
            ...state,
            cards: action.data.cards,
            navigations: action.data.navigations,
            user: action.data.user,
            company: action.data.company,
            userSections: action.data.userSections,
            context: action.data.context,
            home_page: action.data.home_page,
            savedItemsCount: action.data.saved_items || null,
        };
    }
    return state;
}



