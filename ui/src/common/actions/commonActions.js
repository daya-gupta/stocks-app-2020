import {getUserId} from "../util";
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
    return async(dispatch, getState) => {
        try {
            const userId = getUserId(getState);
            dispatch({ type: 'SHOW_LOADER' });
            await axios.put(`${baseUrl}/api/watchlist/active/${watchlist._id}`, {userId});
            dispatch({ type: 'HIDE_LOADER' });
            dispatch({ type: 'ACTIVE_WATCHLIST_CHANGED', data: watchlist });
        } catch (e) {
            dispatch({ type: 'HIDE_LOADER' });
        }
    }
}

export const addWatchlist = (name) => {
    return (dispatch, getState) => {
        const userId = getUserId(getState);
        const payload = {
            name,
            default: false,
            userId,
        }
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.post(`${baseUrl}/api/watchlist`, payload);
        promise.then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            // TBD show success message
            getAllWatchlists()(dispatch, getState);
        });
    };
}

export const deleteWatchlist = (_id) => {
    return (dispatch, getState) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.delete(`${baseUrl}/api/watchlist/${_id}`);
        promise.then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            // TBD show success message
            getAllWatchlists()(dispatch, getState);
        });
    };
}

export const getAllWatchlists = (callback) => {
    return (dispatch, getState) => {
        const userId = getUserId(getState);
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.get(`${baseUrl}/api/watchlist/${userId}`);
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

export const moveCompany = (companyId, targetWatchlistId, callback) => {
    return async(dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        console.timeEnd();
        // const promise = axios.put(`${baseUrl}/api/company/${company._id}`, {comment: company.comment});
        try {
            await axios.put(`${baseUrl}/api/company/${companyId}`, {watchlistId: targetWatchlistId});
            console.time();
            dispatch({ type: 'HIDE_LOADER' });
            dispatch(setError({ message: 'Item moved successfully!!' }));
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

// User---------------
export const registerUser = (user, callback) => {
    return (dispatch, getState) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.post(`${baseUrl}/api/user/register`, user);
        promise.then(res => {
            dispatch({ type: 'HIDE_LOADER' });
            // TBD show success message
            callback && callback();
            getAllUsers()(dispatch, getState);
        });
    };
}

export const getAllUsers = () => {
    return (dispatch, getState) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.get(`${baseUrl}/api/user`);
        promise.then(res => {
            dispatch({ type: 'HIDE_LOADER' });
            dispatch({ type: 'SET_USERS', data: res.data.data });
            // dispatch({ type: 'CHANGE_USER', data: user });
            // TBD show success message
            if (!getState().common.activeWatchlist) {
                getAllWatchlists()(dispatch, getState);
            }
        });
    };
}

export const getBseReturn = (callback) => {
    const promise = axios.get(`${baseUrl}/api/bseReturn`);
    promise.then(res => {
        const data = res.data.data;
        const bseReturn = (data.find(item => item.name === 'BSE 500')).returns;
        callback(bseReturn);
    });
}

export const changeUser = (user) => {
    return (dispatch, getState) => {
        dispatch({ type: 'CHANGE_USER', data: user });
        getAllWatchlists()(dispatch, getState);
    }
}
