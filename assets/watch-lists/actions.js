import { gettext, notify, errorHandler } from 'utils';
import server from 'server';
import {watchListToEdit, company, scheduleMode} from './selectors';
import {get} from 'lodash';


export const INIT_DATA = 'INIT_DATA';
export function initData(data) {
    return {type: INIT_DATA, data};
}

export const SET_COMPANIES = 'SET_COMPANIES';
export function setCompanies(data) {
    return {type: SET_COMPANIES, data};
}

export function initViewData(data) {
    return function (dispatch) {
        dispatch(setCompanies(data.companies));
    };
}

export const NEW_WATCH_LIST = 'NEW_WATCH_LIST';
export function newWatchList() {
    return {type: NEW_WATCH_LIST};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit() {
    return {type: CANCEL_EDIT};
}

export const UPDATE_WATCH_LIST = 'UPDATE_WATCH_LIST';
export function updateWatchList(event) {
    const target = event.target;
    const field = target.name;
    return {
        type: UPDATE_WATCH_LIST,
        data: {[field]: target.type === 'checkbox' ? target.checked : target.value}
    };
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

export const SET_COMPANY = 'SET_COMPANY';
export function setCompany(company) {
    return {type: SET_COMPANY, company};
}

export const SET_WATCH_LISTS = 'SET_WATCH_LISTS';
export function setWatchLists(data) {
    return {type: SET_WATCH_LISTS, data};
}

export const SET_USER_COMPANY_WATCH_LISTS = 'SET_USER_COMPANY_WATCH_LISTS';
export function setUserCompanyWatchLists(data) {
    return {type: SET_USER_COMPANY_WATCH_LISTS, data};
}

export const QUERY_WATCH_LISTS = 'QUERY_WATCH_LISTS';
export function queryWatchLists() {
    return {type: QUERY_WATCH_LISTS};
}

export const SELECT_WATCH_LIST = 'SELECT_WATCH_LIST';
export function selectWatchList(id) {
    return {type: SELECT_WATCH_LIST, id};
}

export const SET_WATCH_LIST_COMPANIES = 'SET_WATCH_LIST_COMPANIES';
export function setWatchListCompanies(data) {
    return {type: SET_WATCH_LIST_COMPANIES, data};
}

export const SET_SCHEDULE_MODE = 'SET_SCHEDULE_MODE';
export function toggleScheduleMode() {
    return {type: SET_SCHEDULE_MODE};
}

export function postWatchList(userWatchList, notifyMsg) {
    return function (dispatch, getState) {

        const wl = userWatchList || watchListToEdit(getState());
        const url = `/watch_lists/${wl._id ? wl._id : 'new'}`;

        return server.post(url, wl)
            .then(function(item) {
                if (wl._id) {
                    notify.success(notifyMsg || gettext('Watch list updated successfully'));
                } else {
                    notify.success(gettext('Watch list created successfully'));
                    if (!userWatchList) {
                        dispatch(updateWatchList({
                            target: {
                                name: '_id',
                                value: item._id,
                            }
                        }));

                        if (item.users) {
                            dispatch(updateWatchList({
                                target: {
                                    name: 'users',
                                    value: item.users,
                                }
                            }));
                        }
                    }
                }
                dispatch(cancelEdit());
                dispatch(fetchWatchLists(get(userWatchList, 'company')));
            })
            .catch((error) => errorHandler(error, dispatch, setError));

    };
}

export function fetchWatchLists(userCompany) {
    return function (dispatch, getState) {
        dispatch(queryWatchLists());
        const companyFilter = userCompany || company(getState());
        const filter = get(companyFilter, 'length', 0) > 0 ? '&where={"company":"' + companyFilter + '"}' : '';

        return server.get(`/watch_lists/all?q=${filter}`)
            .then((data) => {
                if (!userCompany) {
                    dispatch(setWatchLists(data));
                } else {
                    dispatch(setUserCompanyWatchLists(data));
                }

                if (!scheduleMode(getState())) {
                    return;
                }

                return dispatch(fetchWatchListCompanies());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function fetchWatchListCompanies() {
    return function (dispatch) {
        return server.get('/watch_lists/schedule_companies')
            .then((data) => {
                dispatch(setWatchListCompanies(data));
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function saveWatchListUsers(users) {
    return function (dispatch, getState) {
        const wl = watchListToEdit(getState());
        return server.post(`/watch_lists/${wl._id}/users`, {users})
            .then(() => {
                notify.success(gettext('Watch list users updated successfully'));
                dispatch(fetchWatchLists());
                dispatch(cancelEdit());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function saveWatchListSchedule() {
    return function (dispatch, getState) {
        const wl = watchListToEdit(getState());
        if (!wl._id) {
            notify.error(gettext('Please create the watch list first.'));
        }

        return server.post(`/watch_lists/${wl._id}/schedule`, {schedule: wl.schedule})
            .then(() => {
                notify.success(gettext('Watch list schedule updated successfully'));
                dispatch(fetchWatchLists());
                dispatch(cancelEdit());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}

export function deleteWatchList() {
    return function (dispatch, getState) {

        const wl = watchListToEdit(getState());
        const url = `/watch_lists/${wl._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('Watch List deleted successfully'));
                dispatch(fetchWatchLists());
                dispatch(cancelEdit());
            })
            .catch((error) => errorHandler(error, dispatch, setError));
    };
}
