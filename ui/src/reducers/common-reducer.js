// const localStorageNode = 'app-data';
import { getStorageData } from '../common/util';

const storageData = getStorageData();

const initialState = {
    showLoader: false,
    compareList : [],
    // activeWatchlistIndex: storageData.activeWatchlistIndex,
    // watchlistData: storageData.watchlistData,
    // ...storageData,
    watchlistData: null,
    activeWatchlist: null,
    error: null
}

const commonReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'SHOW_LOADER': {
            const newState = Object.assign({}, state);
            newState.showLoader = true;
            return newState;
        }
        case 'HIDE_LOADER': {
            const newState = Object.assign({}, state);
            newState.showLoader = false;
            return newState;
        }
        case 'COMPARE_LIST': {
            return {
                ...state,
                compareList : action.data
            }
        }
        case 'RESET_ERROR': {
            return {
                ...state,
                error: null
            }
        }
        case 'SET_ERROR': {
            return {
                ...state,
                error: action.data
            }
        }
        case 'ACTIVE_WATCHLIST_CHANGED': {
            return {
                ...state,
                activeWatchlistIndex: action.data
            }
        }
        case 'WATCHLIST_CHANGED': {
            return {
                ...state,
                watchlistData: action.data
            }
        }
        case 'METADATA_CHANGED': {
            return {
                ...state,
                metadata: action.data
            }
        }
        case 'NEW_WATCHLIST_ADDED': {
            return {
                ...state,
                watchlistData: action.data.watchlistData
            }
        }
        case 'SET_USER_WATCHLIST': {
            const activeWatchlist = action.data.find(item => item.default);
            return {
                ...state,
                watchlistData: action.data,
                activeWatchlist 
            }
        }
        default: return state;
    }
}

export default commonReducer;
