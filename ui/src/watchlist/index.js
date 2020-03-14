import './watchlist.scss'
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { getWatchlistData, setCompareList, updataWatchlistData } from './actions';
import { getComparisionListData } from '../comparision/action';
import { setError } from '../common/actions/commonActions';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import WatchlistRow from './components/watchlistRow';
import ChartRender from '../components/BasicChart'
import '../common/styles/watchlist.css';
import {calculateGrowthScore, calculatePriceChange, calculateAveragePriceChange,
    setActiveWatchlistData, getActiveWatchlistData, setStorageData, getStorageData} from '../common/util'

const weeksArr = [0, 1, 2, 4, 9, 13, 26, 52, 72];
// var ref = window.firebase.database().ref();

// ref.on("value", function(snapshot) {
//    console.log(snapshot.val());
// }, function (error) {
//    console.log("Error: " + error.code);
// });

class Watchlist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.initalizeWatchlist();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.common.activeWatchlistIndex !== this.props.common.activeWatchlistIndex) {
            this.initalizeWatchlist();
        }
    }

    initalizeWatchlist = () => {
        // make api call to get data for each item in watchlist
        const watchlist = getActiveWatchlistData();
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
                    const priceVolumeDataItem = priceVolumeData[index];
                    const price = [...priceVolumeDataItem.data.datasets[0].values.map(item => Number(item[1]))];
                    const volume = [...priceVolumeDataItem.data.datasets[1].values.map(item => Number(item[1]))];
                    const change = this.calculateChange(index, { price, volume });
                    // const priceChange = [calculatePriceChange(price, 0), calculatePriceChange(price, 1), calculatePriceChange(price, 2), calculatePriceChange(price, 4), calculatePriceChange(price, 8)]
                    const priceChange = this.getPriceChange(price, weeksArr);
                            
                    watchlistData.push({
                        price: price[price.length - 1],
                        volume: volume[volume.length - 1],
                        growthScore: growthScoreArr[index],
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
                    averagePriceChange: this.getAveragePriceChange(watchlistData, weeksArr),
                });
            });
        });
    }

    getPriceChange = (price, weeks = weeksArr) => {
        const priceChange = [];
        for (const w of weeks) {
            priceChange[w] = calculatePriceChange(price, w);
        }
        return priceChange;
    }

    getAveragePriceChange = (watchlistData, weeks = weeksArr) => {
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
        this.setState({ watchlist, watchlistData })    
    }

    removeStock = (index) => {
        const watchlistData = [...this.state.watchlistData];
        const removedItemFromWatchlistData = watchlistData.splice(index, 1)[0];
        const watchlist = this.state.watchlist;
        const matchingIndexInWatchlist = watchlist.companies.findIndex(item => item.name === removedItemFromWatchlistData.name);
        const removedItemFromWatchlist = watchlist.companies.splice(matchingIndexInWatchlist, 1)[0];
        setActiveWatchlistData(watchlist);
        this.setState({
            watchlist,
            watchlistData,
            // averagePriceChange: [calculateAveragePriceChange(watchlistData, 0), calculateAveragePriceChange(watchlistData, 1), calculateAveragePriceChange(watchlistData, 2), calculateAveragePriceChange(watchlistData, 4), calculateAveragePriceChange(watchlistData, 8)],
            averagePriceChange: this.getAveragePriceChange(watchlistData, weeksArr),
        });
        return removedItemFromWatchlist;
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
            const isDuplicate = watchlistData.companies.find(item => item.id === company.id);
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
            <ChartRender key={index} processedData = {historicalData}/>
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
                return a[paramSplits[0]][paramSplits[1]] - b[paramSplits[0]][paramSplits[1]];
            } else {
                if (numericSort) {
                    return a[param] - b[param];
                }
                return a[param].toLowerCase() > b[param].toLowerCase() ? 1 : -1;
            }
        });
        if (!sortOrder) {
            watchlistData.reverse();    
        }
        this.setState({watchlistData, sortBy: param, sortOrder });
    }

    renderWatchlist = () => {
        const {watchlist, watchlistData, averagePriceChange} = this.state;
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
        console.log(priceChangeRange);
        watchlistData.map(item => item.priceChange)
    
        const html = watchlistData.map((item, index) => {
            return (
                <WatchlistRow
                    key={item.name}
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
                        <th>Score</th>
                        <th style={{width: '20%'}}>
                            <span onClick={() => this.sortBy('name')}>Company</span>
                        </th>
                        {/* <th>
                            <span>
                                OWPC&nbsp;
                                <small>
                                    ({averagePriceChange.map((i, ind) => {
                                        if (!i || !ind) { return null; }
                                        return (
                                            <div onClick={() => this.sortBy(`priceChange.${ind}`, true)}>{i}%,&nbsp;</div>
                                        );
                                    })})
                                </small>
                            </span>
                        </th> */}
                        <th>
                            <span onClick={() => this.sortBy('priceChange.0', true)}>Price <small>({averagePriceChange[0]}% change)</small></span>
                        </th>
                        {averagePriceChange.map((i, ind) => {
                            if (!i || !ind) { return null; }
                            return (
                                <th>
                                    <div onClick={() => this.sortBy(`priceChange.${ind}`, true)}>{ind} WC {i} %</div>
                                </th>
                            );
                        })}
                        {/* <th>Volume <small>(%change)</small></th> */}
                        <th>Rem.</th>
                        <th style={{width: '30%'}}>Chart <small>(Last 25 sessions)</small></th>
                    </tr>
                </thead>
                <tbody>
                    {html}
                </tbody>
            </table>
        );
    }

    render = () => {
        const count = ((this.state.watchlist || {}).companies || []).length;
        return (
            <div>
                <h4>Watchlist ({count} stocks)</h4>
                <Link to={{pathname: `/comparision`}}>
                    <button className="btn">Compare selected stocks &gt;</button>
                </Link>
                {this.renderWatchlist()}
                <button className="btn">Compare selected stocks &gt;</button>
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
    setCompareList,
    getComparisionListData,
    setError
    // moveStock
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(Watchlist);

export default connectedComponent;
