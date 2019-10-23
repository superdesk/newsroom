import {get} from 'lodash';

export const userSelector = (state) => get(state, 'user');
export const selectedMenuSelector = (state) => get(state, 'selectedMenu');
export const selectedItemSelector = (state) => get(state, 'selectedItem');
export const displayModelSelector = (state) => get(state, 'displayModal');
export const userSectionsSelector = (state) => get(state, 'userSections');
export const topicEditorFullscreenSelector = (state) => get(state, 'editorFullscreen') || false;
