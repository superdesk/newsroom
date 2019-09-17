import {get} from 'lodash';

export const sectionsSelector = (state) => get(state, 'sections.list') || [];
export const activeSectionSelector = (state) => get(state, 'sections.active') || '';
export const uiSectionsSelector = (state) => sectionsSelector(state).filter(
    (section) => get(section, 'group') !== 'api'
);
