import { processHistoricalData } from './util';

const historicalData = [["2016-09-09", 1199.9, null, 15857023], ["2016-09-16", 1172.02, null, 11271250]];

const data = processHistoricalData(historicalData, []);
const processedData = [{
    date: "2016-09-09",
    price: 1199.9,
    volume: 15857023,
    revenue: null,
    profit: null
},{
    date: "2016-09-16",
    price: 1172.02,
    volume: 11271250,
    revenue: null,
    profit: null
}]
// const reverseData = data.reverse();

it('should return reverse of historical data', () => {
    expect(JSON.stringify(data)).toBe(JSON.stringify(processedData));
})