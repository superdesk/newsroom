import {get} from 'lodash';

export const userSelector = (state) => get(state, 'user');