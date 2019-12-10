import {get} from 'lodash';

export const context = (state) => get(state, 'context') || null;
