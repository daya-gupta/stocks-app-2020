import { setStorageData, getStorageData } from "../util";

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
