import axios from 'axios';
import {baseUrl} from '../common/constants';
// import { setStorageData, getStorageData } from "../common/util";

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
            const companyId = element.id;
            const test = axios.get(`${baseUrl}/historicalData?companyId=${companyId}&duration=${duration}`);
            const test1 = axios.get(`${baseUrl}/historicalData?companyId=${companyId}&duration=${7}`);
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

export const getActiveWatchlistData = () => {
    return async (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        const companies = await axios.get(`${baseUrl}/api/getCompanies`)
        dispatch({ type: 'HIDE_LOADER' });
        return companies.data;
    }
}

