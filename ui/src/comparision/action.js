import axios from 'axios';

// const host = 'https://www.alphavantage.co/';
const host = 'http://localhost:3300/';

const historicalDataApi = 'query?function=TIME_SERIES_DAILY&apikey=LYK5FRW7A27I9REB';


// export const getComparisionListData = (compareList, callback) => {
//     return (dispatch) => {
//         const promises = [];

//         compareList.forEach(element => {
//             const test = axios.get(`${host}${historicalDataApi}&symbol=NSE:${element}`);
//             promises.push(test);
//         });
//         dispatch({ type: 'SHOW_LOADER' });
//         Promise.all(promises).then(([...res]) => {
//             console.log(res);
//             dispatch({ type: 'HIDE_LOADER' });
//             callback(res);
//         });
//     }
// }

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
    if (tableRows && tableRows.length) {
        const quarterTds = tableRows[0].querySelectorAll('th');
        const revenueTds = tableRows[1].querySelectorAll('td');
        const profitTds = tableRows[10].querySelectorAll('td');
        quarterTds.forEach((item, index) => {
            if (!index) return;
            const quarter = getQuarter((quarterTds[index].textContent || '').trim());
            // processedData.quarter.push((quarterTds[index].textContent||'').trim());
            processedData.quarter.push(quarter);
            processedData.revenue.push((revenueTds[index].textContent || '').replace(/,/g, '').trim());
            processedData.profit.push((profitTds[index].textContent || '').replace(/,/g, '').trim());
        });
    }
    return processedData;
}

export const getConsolidatedData = ({url}, callback) => {
    return (dispatch) => {
        dispatch({ type: 'SHOW_LOADER' });
        // callback({consolidatedData: {test: 'testData'}});
        // axios.get(`http://localhost:3300/historicalData?companyId=${companyId}&duration=${duration}`).then((res) => {
        axios.get(`http://localhost:3300/consolidatedData?url=${url}`).then((res) => {
            dispatch({ type: 'HIDE_LOADER' });
            const processedData = processConsolidatedData(res.data);
            callback(processedData);
        })
    }
}


export const getComparisionListData = (watchlist = [], callback) => {
    return (dispatch) => {
        const promises = [];
        watchlist.forEach(element => {
            // const companyId = element.id;
            // const duration = 30;
            // const test = axios.get(`http://localhost:3300/historicalData?companyId=${companyId}&duration=${duration}`);
            const url = element.url;
            const test =axios.get(`http://localhost:3300/consolidatedData?url=${url}`);
            promises.push(test);
        });
        dispatch({ type: 'SHOW_LOADER' });
        Promise.all(promises).then(([...res]) => {
            dispatch({ type: 'HIDE_LOADER' });
            const processedData = [];
            res.forEach(element => {
                processedData.push(processConsolidatedData(element.data));
            });
            callback(processedData);
        })
    }
}
