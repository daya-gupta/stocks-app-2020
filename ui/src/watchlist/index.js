import './watchlist.scss'
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { getWatchlistData, setCompareList, updataWatchlistData, getActiveWatchlistData } from './actions';
import { getComparisionListData } from '../comparision/action';
import { setError, getAllWatchlists, removeCompany } from '../common/actions/commonActions';
import Form from 'react-bootstrap/Form';
// import { Link } from 'react-router-dom';
import WatchlistRow from './components/watchlistRow';
import ChartRender from '../components/BasicChart'
import '../common/styles/watchlist.css';
import {calculateGrowthScore, calculatePriceChange, calculateAveragePriceChange,
    setActiveWatchlistData, setStorageData, getStorageData, weeksArray, weeksArrayMapper} from '../common/util'

// var ref = window.firebase.database().ref();

// ref.on("value", function(snapshot) {
//    console.log(snapshot.val());
// }, function (error) {
//    console.log("Error: " + error.code);
// });

class Watchlist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            weeksArr: weeksArray,
            chartWidth: false,
        }
    }

    componentDidMount() {
        let activeWatchlist = this.props.common.activeWatchlist;
        if (activeWatchlist) {
            this.initalizeWatchlist(activeWatchlist._id);
        } else {
            this.props.getAllWatchlists((list) => {
                console.log(list);
                activeWatchlist = list.find(item => item.default);
                this.initalizeWatchlist(activeWatchlist._id);
            });
        }
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.common.activeWatchlistIndex !== this.props.common.activeWatchlistIndex) {
    //         this.initalizeWatchlist();
    //     }
    // }

    initalizeWatchlist = async (watchlistId) => {
        // make api call to get data for each item in watchlist
        const companies = await this.props.getActiveWatchlistData(watchlistId);
        const watchlist = { companies };
        this.props.getWatchlistData(watchlist.companies, (priceVolumeData) => {
            const watchlistData = [];
            const growthScoreArr = [];
            this.props.getComparisionListData(watchlist.companies, (compareListData) => {
                const earningData = [];
                watchlist.companies.forEach((data, index) => {
                    const compareListDataItem = compareListData[index];
                    const processedData = []
                    for (let index = 0; index < compareListDataItem.quarter.length; index++) {
                        const date = compareListDataItem.quarter[index];
                        const revenue = Number(compareListDataItem.revenue[index]);
                        const profit = Number(compareListDataItem.profit[index]);
                        processedData.push({ date, revenue, profit });
                    }
                    earningData.push(processedData);
                    growthScoreArr.push(calculateGrowthScore(processedData));
                });
                watchlist.companies.forEach((element, index) => {
                    const priceVolumeDataItem = priceVolumeData[2 * index];
                    const priceVolumeDataItem1 = priceVolumeData[2 * index + 1];
                    const price = [...priceVolumeDataItem.data.datasets[0].values.map(item => Number(item[1]))];
                    const price1 = [...priceVolumeDataItem1.data.datasets[0].values.map(item => Number(item[1]))];
                    const lastPrice = price1.pop();
                    const secondLastPrice = price1.pop();
                    // price.pop();
                    // price.push(secondLastPrice);
                    // price.push(lastPrice);
                    price.splice(price.length - 1, 1, secondLastPrice, lastPrice);

                    const volume = [...priceVolumeDataItem.data.datasets[1].values.map(item => Number(item[1]))];
                    const volume1 = [...priceVolumeDataItem1.data.datasets[1].values.map(item => Number(item[1]))];
                    const lastVolume = volume1.pop();
                    const secondLastVolume = volume1.pop();
                    // price.pop();
                    // price.push(secondLastPrice);
                    // price.push(lastPrice);
                    volume.splice(volume.length - 1, 1, secondLastVolume, lastVolume);

                    const change = this.calculateChange(index, { price, volume });
                    // const priceChange = [calculatePriceChange(price, 0), calculatePriceChange(price, 1), calculatePriceChange(price, 2), calculatePriceChange(price, 4), calculatePriceChange(price, 8)]
                    const priceChange = this.getPriceChange(price);
                            
                    watchlistData.push({
                        price: price[price.length - 1],
                        volume: volume[volume.length - 1],
                        growthScore: growthScoreArr[index],
                        score: growthScoreArr[index].combinedScore,
                        change,
                        ...element,
                        historicalData: { price, volume },
                        priceChange
                    });
                });

                this.setState({
                    watchlist,
                    watchlistData,
                    // averagePriceChange: [calculateAveragePriceChange(watchlistData, 0), calculateAveragePriceChange(watchlistData, 1), calculateAveragePriceChange(watchlistData, 2), calculateAveragePriceChange(watchlistData, 4), calculateAveragePriceChange(watchlistData, 8)],
                    averagePriceChange: this.getAveragePriceChange(watchlistData),
                });
            });
        });
    }

    calculatePriceChange = (prices, noOfWeeks) => {
        // const days = noOfWeeks === 0 ? 1 : noOfWeeks * 5;
        const offset = noOfWeeks ? noOfWeeks + 1 : 1;
        // const latestPrice = prices[prices.length - 1] || 0;
        // const previousPrice = prices[prices.length - 1 - days] || prices[0] || 1;
        const latestPrice = prices[0] || 0;
        const previousPrice = prices[offset];
        let change = 'NA';
        if (previousPrice) {
            change = (latestPrice - previousPrice)/previousPrice;
            change = (change * 100).toFixed(2);
        }
        return change;
      }

      getPriceChange = (price) => {
        const weeks = this.state.weeksArr;
        const priceChange = [];
        price = price.slice(0).reverse();
        for (const w of weeks) {
            priceChange[w] = this.calculatePriceChange(price, w);
        }
        return priceChange;
    }

    getAveragePriceChange = (watchlistData) => {
        const weeks = this.state.weeksArr;
        const averagePriceChange = [];
        for (const w of weeks) {
            averagePriceChange[w] = calculateAveragePriceChange(watchlistData, w);
        }
        return averagePriceChange;
    }

    handleCheckboxChange = (event, index) => {
        const { watchlistData, watchlist } = this.state;
        const watchlistDataItem = watchlistData[index];
        if (typeof(index) === 'undefined') {
            // master
            for (let item of watchlist.companies) {
                item.checked = event.target.checked;
            }
            for (let item of watchlistData) {
                item.checked = event.target.checked;
            }
        } else {
            const checked = event.target.checked;
            const matchingIndexInWatchlist = this.state.watchlist.companies.findIndex(item => item.name === watchlistDataItem.name);
            const watchlistItem = watchlist.companies[matchingIndexInWatchlist];
            watchlistItem.checked = checked;
            watchlistDataItem.checked = checked;
        }
        setActiveWatchlistData(watchlist);
        this.setState({ watchlist, watchlistData });
    }

    compare = (param) => {
        if (!param) {
            const { watchlist, watchlistData } = this.localData;
            this.setState({
                watchlist,
                watchlistData,
                averagePriceChange: this.getAveragePriceChange(watchlistData),
                compare: false 
            });
            this.localData = {};
            return;
        }
        const { watchlistData, watchlist } = this.state;
        const newWatchlistData = watchlistData.filter(item => item.checked);
        const newWatchlist = {...watchlist, companies: []};
        for (let item of newWatchlistData) {
            const matchingIndexInWatchlist = watchlist.companies.findIndex(item2 => item2.name === item.name);
            newWatchlist.companies.push(watchlist.companies[matchingIndexInWatchlist]);
        }
        this.localData = {
            watchlist,
            watchlistData
        };
        this.setState({
            watchlist: newWatchlist,
            watchlistData: newWatchlistData,
            averagePriceChange: this.getAveragePriceChange(newWatchlistData),
            compare: true
        });
    }

    removeStock = (index) => {
        const companyId = this.state.watchlistData[index]._id;
        // const watchlistId = this.props.common.activeWatchlist._id;
        this.props.removeCompany(companyId, () => {
            const watchlistData = [...this.state.watchlistData];
            const removedItemFromWatchlistData = watchlistData.splice(index, 1)[0];
            const watchlist = this.state.watchlist;
            const matchingIndexInWatchlist = watchlist.companies.findIndex(item => item.name === removedItemFromWatchlistData.name);
            const removedItemFromWatchlist = watchlist.companies.splice(matchingIndexInWatchlist, 1)[0];
            // setActiveWatchlistData(watchlist);
            this.setState({
                watchlist,
                watchlistData,
                // averagePriceChange: [calculateAveragePriceChange(watchlistData, 0), calculateAveragePriceChange(watchlistData, 1), calculateAveragePriceChange(watchlistData, 2), calculateAveragePriceChange(watchlistData, 4), calculateAveragePriceChange(watchlistData, 8)],
                averagePriceChange: this.getAveragePriceChange(watchlistData),
            });
            // return removedItemFromWatchlist;
        });
    }

    moveStock = (index, targetWatchlistIndex) => {
        let company = null;
        if (!this.props.common.activeWatchlistIndex) {
            // if origin is master watchlist - do a copy instead
            const watchlistData = [...this.state.watchlistData];
            const companyInWatchlistData = watchlistData[index];
            const watchlist = this.state.watchlist;
            const matchingIndexInWatchlist = watchlist.companies.findIndex(item => item.name === companyInWatchlistData.name);
            company = watchlist.companies[matchingIndexInWatchlist];
        } else {
            // remove stock from current watchlist and add in target watchlist
            company = this.removeStock(index);
        }
        if (company) {
            let message = 'Item moved/copied successfully!!';
            const storageData = getStorageData();
            const watchlistData = storageData.watchlistData[targetWatchlistIndex];
            const isDuplicate = watchlistData.companies.find(item => item.companyId === company.companyId);
            if (isDuplicate) {
                message = 'Item already exist in target watchlist!!';
            } else {
                watchlistData.companies.push(company);
                storageData.watchlistData[targetWatchlistIndex] = watchlistData;
                setStorageData(storageData);
                updataWatchlistData(storageData.watchlistData);
            }
            // notification
            const error = { message };
            this.props.setError(error);
        }
    }

    renderChart = (historicalData, index) => {
        return (
            <ChartRender processedData = {historicalData}/>
        );
    }

    calculateChange = (index, data) => {
        function calculate(items, isVolume) {
            let change = 'NA';
            if (items && Array.isArray(items) && items.length > 1) {
                const lastItem = items[items.length - 1];
                const secondLastItem = items[items.length - 2];
                change = ((lastItem - (isVolume ? 0 : secondLastItem)) * 100 / secondLastItem).toFixed(2);
            }
            return change;
        }
        return {price: calculate(data.price), volume: calculate(data.volume, true)};
    }

    sortBy = (param, numericSort) => {
        const {watchlistData, sortBy} = this.state;
        let sortOrder = this.state.sortOrder;
        if (sortBy === param) {
            sortOrder = !sortOrder;
        } else {
            sortOrder = true;
        }
        watchlistData.sort((a, b) => {
            if (param.indexOf('priceChange') !== -1) {
                const paramSplits = param.split('.');
                const aValue = a[paramSplits[0]][paramSplits[1]];
                const bValue = b[paramSplits[0]][paramSplits[1]];
                return aValue - bValue || isNaN(aValue) - isNaN(bValue);
            } else {
                if (numericSort) {
                    return a[param] - b[param];
                }
                return (a[param] || '').toLowerCase() > (b[param] || '').toLowerCase() ? 1 : -1;
            }
        });
        if (!sortOrder) {
            watchlistData.reverse();    
        }
        this.setState({watchlistData, sortBy: param, sortOrder });
    }

    renderHeaders = (averagePriceChange) => {
        let counter = 1;
        // const testArr = averagePriceChange.
        const arr = this.state.chartWidth ? averagePriceChange.slice(0, 14) : averagePriceChange;
        return arr.map((value, valueIndex) => {
            if (!value || !valueIndex) { return null; }
            const label = weeksArrayMapper[counter++].label;
            return (
                <th key={value}>
                    <div onClick={() => this.sortBy(`priceChange.${valueIndex}`, true)}>{label} {value} %</div>
                </th>
            );
        });
    }
    

    renderWatchlist = () => {
        const {watchlist, watchlistData, averagePriceChange, weeksArr, chartWidth} = this.state;
        if( !watchlist || !watchlistData || !watchlistData.length ) {
            return null;
        }
        const masterChecked = watchlist.companies.findIndex(item => !item.checked) === -1 ? true : false;
        const priceChangeRange = [];
        for (const w of weeksArr) {
            const priceChangeArr = watchlistData.map(item => Number(item.priceChange[w]));
            const max = _.max(priceChangeArr);
            const min = _.min(priceChangeArr);
            priceChangeRange.push([min, max]);
        }
        watchlistData.map(item => item.priceChange)
    
        const html = watchlistData.map((item, index) => {
            return (
                <WatchlistRow
                    key={item.name}
                    weeksArr={this.state.weeksArr}
                    chartWidth={this.state.chartWidth}
                    index={index}
                    item={item}
                    handleCheckboxChange={(e) => this.handleCheckboxChange(e, index)}
                    renderChart={this.renderChart}
                    removeStock={this.removeStock}
                    moveStock={(targetWatchlistIndex) => this.moveStock(index, targetWatchlistIndex)}
                    watchlist={watchlist}
                    watchlistData={watchlistData}
                    priceChangeRange={priceChangeRange}
                />
            );
        });
        return (
            <table className="table table-stripped">
                <thead>
                    <tr>
                        <th>
                            <Form.Check type='checkbox' checked={masterChecked} onChange={this.handleCheckboxChange} />    
                        </th>
                        <th><span onClick={() => this.sortBy('color')}>Color</span></th>
                        <th><span onClick={() => this.sortBy('score', true)}>Score</span></th>
                        <th style={{width: '20%'}}>
                            <span onClick={() => this.sortBy('name')}>Company</span>
                        </th>
                        <th>
                            <span onClick={() => this.sortBy('priceChange.0', true)}>Price <small>({averagePriceChange[0]}% change)</small></span>
                        </th>
                        {this.renderHeaders(averagePriceChange)}
                        {/* <th>Volume <small>(%change)</small></th> */}
                        {!chartWidth && <th>Delete</th>}
                        <th style={{width: '100%'}}>Chart</th>
                    </tr>
                </thead>
                <tbody>
                    {html}
                </tbody>
            </table>
        );
    }

    renderCompareView = () => {
        return (
            <div>
                {!this.state.compare && <button onClick={() => this.compare(true)} className="btn">Compare selected stocks &gt;</button>}
                {this.state.compare && <button onClick={() => this.compare(false)} className="btn">Back to Main view &gt;</button>}
            </div>
        )
    }

    changeChartWidth = () => {
        const chartWidth = !this.state.chartWidth
        const weeksArr = chartWidth ? weeksArray.slice(0, 6) : weeksArray;
        this.setState({chartWidth, weeksArr});
    }

    render = () => {
        const count = ((this.state.watchlist || {}).companies || []).length;
        return (
            <div>
                <h4>Watchlist ({count} stocks)</h4>
                <button onClick={() => this.changeChartWidth()}>
                    Change Chart Width
                </button>
                {/* <Link to={{pathname: `/comparision`}}>
                    <button className="btn">Compare selected stocks &gt;</button>
                </Link> */}
                {this.renderCompareView()}
                {this.renderWatchlist()}
                {this.renderCompareView()}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    watchlist: state.watchlist,
    common: state.common
})

const mapDispatchToProps = {
    getWatchlistData,
    getActiveWatchlistData,
    setCompareList,
    getComparisionListData,
    setError,
    getAllWatchlists,
    removeCompany,
    // moveStock
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(Watchlist);

export default connectedComponent;
