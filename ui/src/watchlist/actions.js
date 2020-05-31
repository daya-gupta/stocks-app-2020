import axios from 'axios';
import {baseUrl} from '../common/constants';
// import { getAllWatchlists } from '../common/actions/commonActions';

// const duration = 366;
const duration = 1850;

export const getHistoricalData = ({companyId, duration}, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        axios.get(`${baseUrl}/historicalData?companyId=${companyId}&duration=${duration}`).then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            callback(res.data);
        })
    }
}

export const getWatchlistData = (watchlist, callback) => {
    return (dispatch) => {
        const promises = [];
        watchlist.forEach(element => {
            // const companyId = element.id;
            const test = axios.get(`${baseUrl}/historicalData?companyId=${element.companyId}&duration=${duration}`);
            const test1 = axios.get(`${baseUrl}/historicalData?companyId=${element.companyId}&duration=${7}`);
            promises.push(test);
            promises.push(test1);
        });
        dispatch({ type: 'SHOW_LOADER' });
        Promise.all(promises).then(([...res]) => {
            dispatch({ type: 'HIDE_LOADER' });
            callback(res);
        });
    }
} 

export  const setCheckboxSelectionList = (CheckboxSelectionList)=>{
    return (dispatch)=> dispatch({type:'CHECKBOX_SELECTION_LIST', data : CheckboxSelectionList})
} 
export  const setCompareList = (compareList)=>{
    return (dispatch)=> dispatch({type:'COMPARE_LIST', data : compareList})
}

export const updataWatchlistData = (data) => {
    return (dispatch)=> dispatch({type:'UPDATE_WATCHLIST_DATA', data})
}

export const getActiveWatchlistData = (watchlist) => {
    return async (dispatch) => {
        // for master watchlist - get data from all the watchlists
        const watchlistId = watchlist.name === 'Master' ? 0 : watchlist._id;
        const userId = watchlist.userId;
        dispatch({ type: 'SHOW_LOADER' });
        const companies = await axios.get(`${baseUrl}/api/company/watchlist/${watchlistId}/${userId}`);
        dispatch({ type: 'HIDE_LOADER' });
        return companies.data;
    }
}

export const updateComment = (company, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        const promise = axios.put(`${baseUrl}/api/company/${company._id}`, {comment: company.comment});
        promise.then(res => {
            dispatch({ type: 'HIDE_LOADER' });
            callback && callback();
        })
    }
}

