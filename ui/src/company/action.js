
import axios from 'axios';
import {baseUrl} from '../common/constants';
import {getUserId} from '../common/util';
// const historicalDataApi = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&apikey=LYK5FRW7A27I9REB';
// const historicalDataApi = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=LYK5FRW7A27I9REB';
// const historicalDataApi = 'https://www.screener.in/api/2/company/3365/prices/?days=30';

export const getHistoricalData = ({companyId, duration}, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        // axios.get(`${historicalDataApi}&symbol=NSE:${stock}`).then((res) => {
        axios.get(`${baseUrl}/historicalData?companyId=${companyId}&duration=${duration}`).then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            callback(res.data);
        })
    }
}

const getMonth = (month) => {
    switch(month.toLowerCase()) {
        case 'mar': return '03';
        case 'jun': return '06';
        case 'sep': return '09';
        case 'dec': return '12';
    }
}

const getQuarter = (data) => {
    const qSplit = data.split(' ');
    const year = qSplit[1];
    const month = getMonth(qSplit[0]);
    const quarter = `${year}-${month}`;
    return quarter;
}

const processConsolidatedData = (data) => {
    const processedData = {
        quarter: [], revenue: [], profit: []
    }
    var parser = new DOMParser();
    var doc = parser.parseFromString(data, "text/html");
    // var body = doc.querySelector('body');
    const tableRows = doc.querySelectorAll('body #quarters table tr');
    const quarterTds = tableRows[0].querySelectorAll('th');
    const revenueTds = tableRows[1].querySelectorAll('td');
    const profitTds = tableRows[10].querySelectorAll('td');
    quarterTds.forEach((item, index) => {
        if (!index) return;
        const quarter = getQuarter((quarterTds[index].textContent||'').trim());
        // processedData.quarter.push((quarterTds[index].textContent||'').trim());
        processedData.quarter.push(quarter);
        processedData.revenue.push((revenueTds[index].textContent||'').replace(/,/g, '').trim());
        processedData.profit.push((profitTds[index].textContent||'').replace(/,/g, '').trim());
    });
    return processedData;
}

export const getConsolidatedData = ({url}, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        axios.get(`${baseUrl}/consolidatedData?url=${url}`).then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            const processedData = processConsolidatedData(res.data);
            callback(processedData);
        }).catch((error) => {
            const message = error.message;
            const isHtml = false;
            const messagetype = 'error';
            const errorObject = { message, isHtml, messagetype  };
            dispatch({ type: 'SET_ERROR', data: errorObject });
        });
    }
}

export const searchCompany = (data, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        axios.get(`${baseUrl}/searchCompany?data=${data}`).then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            callback(res.data);
        })
    }
}

export const addCompany = (selectedCompany, callback) => {
    return (dispatch, getState) => {
        const userId = getUserId(getState);
        selectedCompany.userId = userId;
        dispatch({ type: 'SHOW_LOADER' });
        axios.post(`${baseUrl}/api/company`, selectedCompany).then((res, error) => {
            dispatch({ type: 'HIDE_LOADER' });
            callback(res, error);
        })
    }
}


