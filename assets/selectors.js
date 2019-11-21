import {get} from 'lodash';
import {createSelector} from 'reselect';

export const formats = (state) => get(state, 'formats') || [];
export const context = (state) => get(state, 'context') || null;

export const getFormats = createSelector([formats],(f) => (f.map((format) =>
    ({value: format.format, text: format.name}))));
