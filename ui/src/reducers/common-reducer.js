const initialState = {
    showLoader: false,
    compareList : [],
    watchlistData: null,
    activeWatchlist: null,
    error: null,
    users: null
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
        case 'NEW_WATCHLIST_ADDED': {
            return {
                ...state,
                watchlistData: action.data.watchlistData
            }
        }
        case 'SET_USER_WATCHLIST': {
            const watchlistData = action.data || [];
            // debugger;
            const defaultWatchlist = watchlistData.find(item => item.default);
            const activeWatchlist = watchlistData.find(item => item.active) || action.data[0];
            return {
                ...state,
                watchlistData,
                activeWatchlist,
                defaultWatchlistId: (defaultWatchlist || {})._id,
            }
        }
        case 'ACTIVE_WATCHLIST_CHANGED': {
            return {
                ...state,
                activeWatchlist: action.data
            }
        }
        
        // user actions
        case 'SET_USERS': {
            const users = action.data;
            if (users.length) {
                users[0].active = true;
            }
            return {
                ...state,
                users,
            }
        }

        case 'CHANGE_USER': {
            const users = state.users.map(item => {
                item.active = false;
                return item;
            });
            const newUser = users.find(item => item._id === action.data._id);
            newUser.active = true;
            return {
                ...state,
                users,
            }
        }

        default: return state;
    }
}

export default commonReducer;
