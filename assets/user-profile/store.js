import {createStore} from 'utils';
import userReducer from './reducers';


export const store = createStore(userReducer, 'UserProfile');
