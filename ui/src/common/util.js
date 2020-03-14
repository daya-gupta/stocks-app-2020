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

export const getStorageData = () => {
  const storageData = JSON.parse(localStorage.getItem(localStorageNode)) || initialStorageData;
  return storageData;
}

export const setStorageData = (data) => {
  localStorage.setItem(localStorageNode, JSON.stringify(data));
}

export const getActiveWatchlistData = () => {
  const storageData = getStorageData();
  const activeWatchlistIndex = storageData.activeWatchlistIndex;
  const activeWatchlistData = storageData.watchlistData[activeWatchlistIndex];
  if (activeWatchlistData.name === 'Primary') {
    const companies = storageData.watchlistData[0].companies.filter(item => !storageData.metadata[item.id] || !storageData.metadata[item.id].color || storageData.metadata[item.id].color === 'a');
    activeWatchlistData.companies = companies;
  } else if (activeWatchlistData.name === 'Secondary') {
    const companies = storageData.watchlistData[0].companies.filter(item => storageData.metadata[item.id] && storageData.metadata[item.id].color === 'c');
    activeWatchlistData.companies = companies;
  } else if (activeWatchlistData.name === 'Test') {
    const companies = storageData.watchlistData[0].companies.filter(item => storageData.metadata[item.id] && storageData.metadata[item.id].color === 'b');
    activeWatchlistData.companies = companies;
  }
  return activeWatchlistData;
}

export const setActiveWatchlistData = (data) => {
  const storageData = getStorageData();
  const activeWatchlistIndex = storageData.activeWatchlistIndex;
  storageData.watchlistData[activeWatchlistIndex] = data;
  localStorage.setItem(localStorageNode, JSON.stringify(storageData));
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
  const offset = noOfWeeks === 0 ? 1 : noOfWeeks * 5;
  const lastPrice = prices[prices.length - 1] || 0;
  const previousPrice = prices[prices.length - 1 - offset] || prices[0];
  const change = ((lastPrice - previousPrice)/(previousPrice * .01 || 1)).toFixed(2);
  return change;
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
  const averageProfitScore = (profitScore/(processedData.length - 4)).toFixed(2);
  const averageRevenueScore = (revenueScore/(processedData.length - 4)).toFixed(2);
  return {
      profitScore,
      revenueScore,
      averageProfitScore,
      averageRevenueScore
  };
}