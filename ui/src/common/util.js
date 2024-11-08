import {localStorageNode} from './constants';

const initialStorageData = {
  activeWatchlistIndex: 0,
  watchlistData: [{
    name: 'Master',
    companies: [],
  }],
  metadata: {
    hdfcbank: {
      note: 'good results!!',
      color: 0
    }
  }
}

// export const weeksArray = [0, 1, 2, 4, 9, 13, 26, 52, 104, 156, 260, 500];
export const weeksArray = [0, 1, 2, 4, 9, 13, 26, 52, 104, 156, 260];

export const weeksArrayMapper = [
  {w: 0, label: '1D'},
  {w: 1, label: '1W'},
  {w: 2, label: '2W'},
  {w: 4, label: '1M'},
  {w: 9, label: '2M'},
  {w: 14, label: '3M'},
  {w: 26, label: '6M'},
  {w: 52, label: '1Y'},
  {w: 104, label: '2Y'},
  {w: 156, label: '3Y'},
  {w: 260, label: '5Y'},
  // {w: 250, label: 'RS'},
];

export const getStorageData = () => {
  const storageData = JSON.parse(localStorage.getItem(localStorageNode)) || initialStorageData;
  return storageData;
}

export const setStorageData = (data) => {
  localStorage.setItem(localStorageNode, JSON.stringify(data));
}

export const processHistoricalData = (historicalData, consolidatedData = []) => {
    if (!historicalData || !historicalData.datasets || !historicalData.datasets[0]) {
        return [];
    }
    const priceValues = historicalData.datasets[0].values;
    const volumeValues = historicalData.datasets[1].values;
    const processedData = priceValues.map((item, index) => ({
        date: item[0],
        price: Number(item[1]),
        volume: Number(volumeValues[index][1]),
        revenue: null,
        profit: null
    }))
    if (consolidatedData.quarter) {
        consolidatedData.quarter.map((item, index) => {
            const matchingIndex = processedData.findIndex(value => {
                return value.date.substr(0,7) === item;
            });
            if( matchingIndex !== -1 ) {
                processedData[matchingIndex].revenue = Number(consolidatedData.revenue[index]);
                processedData[matchingIndex].profit = Number(consolidatedData.profit[index]);
            }
        });
    }
    return processedData;
}

export const calculateAveragePriceChange = (watchlistData, noOfWeeks) => {
  const totalPriceChange = watchlistData.reduce((a, b) => {
    return a + (Number(b.priceChange[noOfWeeks]) || 0);
  }, 0);
  const averagePriceChange = watchlistData.length ? (totalPriceChange / watchlistData.length).toFixed(2) : 'NA';
  return averagePriceChange;
}

export const calculatePriceChange = (prices, noOfWeeks) => {
  const days = noOfWeeks === 0 ? 1 : noOfWeeks * 5;
  const latestPrice = prices[prices.length - 1] || 0;
  const previousPrice = prices[prices.length - 1 - days] || prices[0] || 1;
  const change = (latestPrice - previousPrice)/previousPrice;
  return (change * 100).toFixed(2);
}

export const calculateScore = (arr) => {
    const arrLength = arr.length;
    let score = 0;
    if (arrLength >= 6) {
      for(let i = 4; i < arrLength; i++) {
        if (arr[i] < 0) {
          score = score - 2;
          continue;
        }
        const benchmark = arr[i-4];
        if (benchmark < 0) {
          continue;
        }
        if (arr[i] > benchmark * 1.5) {
          score = score + 3;
        } else if (arr[i] > benchmark * 1.25) {
          score = score + 2;
        } else if (arr[i] > benchmark * 1.10) {
          score = score + 1;
        } else if (arr[i] < benchmark * .7) {
          score = score - 2;

        } else if (arr[i] < benchmark * .9) {
          score = score - 1;
        };
      }
    }
    return score;
}

export const calculateGrowthScore = (processedData) => {
  const revenueData = processedData.map((item) => item.revenue);
  const profitData = processedData.map((item) => item.profit);
  const revenueScore = calculateScore(revenueData);
  const profitScore = calculateScore(profitData);
  const combinedScore = revenueScore + profitScore;
  const averageProfitScore = (profitScore/(processedData.length - 4)).toFixed(2);
  const averageRevenueScore = (revenueScore/(processedData.length - 4)).toFixed(2);
  return {
      profitScore,
      revenueScore,
      combinedScore,
      averageProfitScore,
      averageRevenueScore
  };
}

export const getUserId = (getState) => {
  const user = (getState().common.users || []).find(item => item.active) || {};
  return user._id;
}

