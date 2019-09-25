import {get} from 'lodash';

export const noNavigationSelected = (activeNavigation) => (
    get(activeNavigation, 'length', 0) < 1
);

export const getNavigationUrlParam = (activeNavigation) => (
    noNavigationSelected(activeNavigation) ? null : encodeURIComponent(activeNavigation)
);
