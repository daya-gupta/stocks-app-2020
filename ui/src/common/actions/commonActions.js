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

export const selectWatchlist = (selectedIndex) => {
    const storageData = getStorageData();
    storageData.activeWatchlistIndex = selectedIndex;
    // updateLocalStorage(storageData);
    setStorageData(storageData);
    return { type: 'ACTIVE_WATCHLIST_CHANGED', data: selectedIndex };
}

export const addNewWatchlist = (name) => {
    const storageData = getStorageData();
    // const label = name.split(' ').join('').toLowerCase();
    storageData.watchlistData.push({ name, companies: [] });
    // storageData.watchlistData[label] = [];
    setStorageData(storageData);
    return { type: 'NEW_WATCHLIST_ADDED', data: storageData };
}

export const updateMetadata = (companyId, metadataType, metadataValue) => {
    const storageData = getStorageData();
    const watchlistMetadata = (storageData.metadata || {});
    const companyMetadata = watchlistMetadata[companyId] || {};
    companyMetadata[metadataType] = metadataValue;
    storageData.metadata[companyId] = companyMetadata;
    setStorageData(storageData);
    return { type: 'METADATA_CHANGED', data: watchlistMetadata };
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

export const updateComment = (company, callback) => {
    return async(dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        await axios.put(`${baseUrl}/api/company/${company._id}`, {comment: company.comment});
        dispatch({ type: 'HIDE_LOADER' });
        callback && callback();
    }
}
