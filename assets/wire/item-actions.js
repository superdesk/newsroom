import {getItemActions} from '../item-actions';
import * as wireActions from './actions';

export default (dispatch) => getItemActions(dispatch, wireActions);
