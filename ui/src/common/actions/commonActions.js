import { setStorageData, getStorageData } from "../util";
import axios from 'axios';
import {baseUrl} from '../constants';

export const resetError = () => (
    { type: 'RESET_ERROR' }
);

export const setError = ({ message, isHtml = false, messageType = 'error'}) => {
    const error = { message, isHtml, messageType  };
    return { type: 'SET_ERROR', data: error };
}

export const selectWatchlist = (watchlist) => {
    return async(dispatch) => {
        try {
            await axios.put(`${baseUrl}/api/watchlist/active/${watchlist._id}`);
            dispatch({ type: 'HIDE_LOADER' });
            dispatch({ type: 'ACTIVE_WATCHLIST_CHANGED', data: watchlist });
        } catch (e) {
            dispatch({ type: 'HIDE_LOADER' });
        }
    }
}

export const addWatchlist = (name) => {
    return (dispatch) => {
        const payload = {
            name,
            default: false,
        }
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.post(`${baseUrl}/api/watchlist`, payload);
        promise.then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            // TBD show success message
            getAllWatchlists()(dispatch);
        });
    };
}

export const deleteWatchlist = (_id) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.delete(`${baseUrl}/api/watchlist/${_id}`);
        promise.then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            // TBD show success message
            getAllWatchlists()(dispatch);
        });
    };
}

export const getAllWatchlists = (callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.get(`${baseUrl}/api/watchlist`);
        promise.then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            dispatch({ type: 'SET_USER_WATCHLIST', data: res.data });
            callback && callback(res.data);
        });
    }
}

export const removeCompany = (companyId, callback) => {
    return async(dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        await axios.delete(`${baseUrl}/api/company/${companyId}`);
        dispatch({ type: 'HIDE_LOADER' });
        callback && callback();
    }
}

export const moveCompany = (companyId, watchlistIndex, callback) => {
    return async(dispatch, getState) => {
        const targetWatchlist = getState().common.watchlistData[watchlistIndex];
        dispatch({ type: 'SHOW_LOADER' });
        // const promise = axios.put(`${baseUrl}/api/company/${company._id}`, {comment: company.comment});
        try {
            await axios.put(`${baseUrl}/api/company/${companyId}`, {watchlistId: targetWatchlist._id});
            dispatch({ type: 'HIDE_LOADER' });
            callback && callback(true);
        } catch (e) {
            dispatch({ type: 'HIDE_LOADER' });
        }
    }
}

export const updateComment = (_id, comment, callback) => {
    return async(dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        await axios.put(`${baseUrl}/api/company/${_id}`, {comment});
        dispatch({ type: 'HIDE_LOADER' });
        callback && callback();
    }
}

export const updateColor = (_id, color, callback) => {
    return async(dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        await axios.put(`${baseUrl}/api/company/${_id}`, {color});
        dispatch({ type: 'HIDE_LOADER' });
        callback && callback();
    }
}
