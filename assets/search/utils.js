import {get} from 'lodash';

export const noNavigationSelected = (activeNavigation) => (
    get(activeNavigation, 'length', 0) < 1
);

export const getNavigationUrlParam = (activeNavigation, ignoreEmpty = true, useJSON = true) => {
    if (!ignoreEmpty && noNavigationSelected(activeNavigation)) {
        return null;
    }

    return useJSON ?
        JSON.stringify(activeNavigation) :
        (activeNavigation || []).join(',');
};

export const getSearchParams = (custom, topic) => {
    const params = {};

    ['query', 'created', 'navigation', 'filter'].forEach(
        (field) => {
            if (get(custom, field)) {
                params[field] = custom[field];
            } else if (get(topic, field)) {
                params[field] = topic[field];
            }
        }
    );

    return params;
};
