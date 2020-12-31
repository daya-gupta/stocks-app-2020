import './watchlist.scss'
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { getWatchlistData, setCompareList, getActiveWatchlistData } from './actions';
import { getComparisionListData } from '../comparision/action';
import { setError, getAllWatchlists, removeCompany, moveCompany, getBseReturn } from '../common/actions/commonActions';
import Form from 'react-bootstrap/Form';
// import { Link } from 'react-router-dom';
import WatchlistRow from './components/watchlistRow';
import ChartRender from '../components/BasicChart'
import '../common/styles/watchlist.css';
import {calculateGrowthScore, calculateAveragePriceChange, weeksArray, weeksArrayMapper} from '../common/util'

const localData = {
    showOverallReturn: true
}

class Watchlist extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            weeksArr: weeksArray,
            chartWidth: false,
        }
    }

    componentDidMount() {
        getBseReturn((bseReturn) => {
            this.setState({bseReturn});
        });
        let activeWatchlist = this.props.activeWatchlist;
        if (activeWatchlist) {
            this.initalizeWatchlist(activeWatchlist);
        } else {
            this.props.getAllWatchlists((list) => {
                activeWatchlist = list.find(item => item.active) || list[0];
                this.initalizeWatchlist(activeWatchlist);
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.common.activeWatchlistIndex !== this.props.common.activeWatchlistIndex) {
        if (nextProps.activeWatchlist && nextProps.activeWatchlist !== this.props.activeWatchlist) {
            const activeWatchlist = nextProps.activeWatchlist;
            this.initalizeWatchlist(activeWatchlist);
        }
    }

    initalizeWatchlist = async (w) => {
        if (!(this.props.common.users || []).length) {
            return;
        } else if (!w) {
            return;
        }
        // const watchlistId = this.props.common.activeWatchlist._id;
        // make api call to get data for each item in watchlist
        const companyList = await this.props.getActiveWatchlistData(w);
        this.props.getWatchlistData(companyList, (priceVolumeData) => {
            const watchlistData = [];
            const growthScoreArr = [];
            this.props.getComparisionListData(companyList, (compareListData) => {
                // const earningData = [];
                companyList.forEach((data, index) => {
                    const compareListDataItem = compareListData[index];
                    const processedData = []
                    for (let index = 0; index < compareListDataItem.quarter.length; index++) {
                        const date = compareListDataItem.quarter[index];
                        const revenue = Number(compareListDataItem.revenue[index]);
                        const profit = Number(compareListDataItem.profit[index]);
                        processedData.push({ date, revenue, profit });
                    }
                    // earningData.push(processedData);
                    growthScoreArr.push(calculateGrowthScore(processedData));
                });
                companyList.forEach((element, index) => {
                    const priceVolumeDataItem = priceVolumeData[2 * index];
                    const priceVolumeDataItem1 = priceVolumeData[2 * index + 1];
                    const price = [...priceVolumeDataItem.data.datasets[0].values.map(item => Number(item[1]))];
                    const price1 = [...priceVolumeDataItem1.data.datasets[0].values.map(item => Number(item[1]))];
                    const lastPrice = price1.pop();
                    const secondLastPrice = price1.pop();
                    price.splice(price.length - 1, 1, secondLastPrice, lastPrice);

                    const volume = [...priceVolumeDataItem.data.datasets[1].values.map(item => Number(item[1]))];
                    const volume1 = [...priceVolumeDataItem1.data.datasets[1].values.map(item => Number(item[1]))];
                    const lastVolume = volume1.pop();
                    const secondLastVolume = volume1.pop();
                    volume.splice(volume.length - 1, 1, secondLastVolume, lastVolume);

                    const change = this.calculateChange(index, { price, volume });
                    const priceChange = this.getPriceChange(price);
                            
                    watchlistData.push({
                        price: price[price.length - 1],
                        volume: volume[volume.length - 1],
                        growthScore: growthScoreArr[index],
                        score: growthScoreArr[index].combinedScore,
                        change,
                        companyId: element.companyId,
                        historicalData: { price, volume },
                        priceChange
                    });
                });

                this.setState({
                    companyList,
                    watchlistData,
                    averagePriceChange: this.getAveragePriceChange(watchlistData),
                });
            });
        });
    }

    calculatePriceChange = (prices, noOfWeeks) => {
        if (noOfWeeks === 500) {
            const latestPrice = prices[0];
            let previousPrice = prices[2];
            let change1 = 'NA';
            if (previousPrice) {
                change1 = (latestPrice - previousPrice)/previousPrice;
                change1 = change1 * 100;
            }
            previousPrice = prices[3];
            let change2 = 'NA';
            if (previousPrice) {
                change2 = (latestPrice - previousPrice)/previousPrice;
                change2 = change2 * 100;
            }
            return (change1 + change2).toFixed(2);    
        }
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
        const { watchlistData } = this.state;
        const checked = event.target.checked;
        // const watchlistDataItem = watchlistData[index];
        if (typeof(index) === 'undefined') {
            // master
            for (let item of watchlistData) {
                item.checked = checked;
            }
        } else {
            watchlistData[index].checked = checked;
            // const matchingIndexInWatchlist = companyList.findIndex(item => item.name === watchlistDataItem.name);
            // const watchlistItem = companyList[matchingIndexInWatchlist];
            // watchlistItem.checked = checked;
            // watchlistDataItem.checked = checked;
        }
        // setActiveWatchlistData(watchlist);
        this.setState({ watchlistData });
    }

    compare = (param) => {
        this.setState({
            compare: param
        });
        // if (!param) {
        //     const { watchlist, watchlistData } = this.localData;
        //     this.setState({
        //         watchlist,
        //         watchlistData,
        //         averagePriceChange: this.getAveragePriceChange(watchlistData),
        //         compare: false 
        //     });
        //     this.localData = {};
        //     return;
        // }
        // const { watchlistData, watchlist } = this.state;
        // const newWatchlistData = watchlistData.filter(item => item.checked);
        // const newWatchlist = {...watchlist, companies: []};
        // for (let item of newWatchlistData) {
        //     const matchingIndexInWatchlist = watchlist.companies.findIndex(item2 => item2.name === item.name);
        //     newWatchlist.companies.push(watchlist.companies[matchingIndexInWatchlist]);
        // }
        // this.localData = {
        //     watchlist,
        //     watchlistData
        // };
        // this.setState({
        //     watchlist: newWatchlist,
        //     watchlistData: newWatchlistData,
        //     averagePriceChange: this.getAveragePriceChange(newWatchlistData),
        //     compare: true
        // });
    }

    removeStock = (index) => {
        const companyId = this.state.companyList[index]._id;
        this.props.removeCompany(companyId, () => {
            this.removeCompanyAndUpdateWatchlist(index)
        });
    }

    removeCompanyAndUpdateWatchlist = (index) => {
        const watchlistData = this.state.watchlistData;
        watchlistData.splice(index, 1);
        const companyList = this.state.companyList;
        companyList.splice(index, 1);
        this.setState({
            companyList,
            watchlistData,
            averagePriceChange: this.getAveragePriceChange(watchlistData),
        });
    }

    moveStock = (stockIndex, targetWatchlistId) => {
        const watchlistData = this.state.watchlistData;
        const companyInWatchlistData = watchlistData[stockIndex];
        const companyList = this.state.companyList;
        const matchingIndexInWatchlist = companyList.findIndex(item => item.companyId === companyInWatchlistData.companyId);
        const company = companyList[matchingIndexInWatchlist];
        this.props.moveCompany(company._id, targetWatchlistId, (success) => {
            // console.time();
            if (success) {
                // update watchlistId
                company.watchlistId = targetWatchlistId;
                this.setState({companyList});
                // if origin is master watchlist - do not remove from list
                if (!this.props.activeWatchlist.default) {
                    this.removeCompanyAndUpdateWatchlist(stockIndex);
                }
            }
            console.timeEnd();
        })
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
        console.time();
        const {watchlistData, sortBy} = this.state;
        let sortOrder = this.state.sortOrder;
        if (sortBy === param) {
            sortOrder = !sortOrder;
        } else {
            sortOrder = false;
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
        console.timeEnd();
        console.time();
        if (!sortOrder) {
            watchlistData.reverse();    
        }
        console.timeEnd();
        console.time();
        // arrange companyList in same order
        const companyList = [];
        watchlistData.forEach(item => {
            const match = this.state.companyList.find(company => company.companyId === item.companyId);
            companyList.push(match);
        })
        this.setState({watchlistData, companyList, sortBy: param, sortOrder });
        console.timeEnd();
    }

    renderHeaders = (averagePriceChange) => {
        let counter = 0;
        const arr = this.state.chartWidth ? averagePriceChange.slice(0, 14) : averagePriceChange;
        const headers = arr.map((value, valueIndex) => {
            // if (!value || !valueIndex) { return null; }
            if (!value) { return null; }
            const label = weeksArrayMapper[counter++].label;
            const bseReturn = (this.state.bseReturn || {})[label] || 'NA';
            return (
                <th key={value}>
                    <div onClick={() => this.sortBy(`priceChange.${valueIndex}`, true)}>
                        <span>{label}</span>
                        <br />
                        {localData.showOverallReturn && <span>
                            <span>{value}%</span>
                            <br />
                            <span>[{bseReturn}%]</span>
                        </span>}
                    </div>
                </th>
            );
        });
        // headers.unshift(
        //     (<th key='refScoreHeader'>
        //         <div>
        //             <span>R Score</span>
        //         </div>
        //     </th>)
        // );
        return headers;
    }
    
    updateCompany = (index, key, value) => {
        const companyList = [...this.state.companyList];
        companyList[index] = {...companyList[index], [key]: value};
        this.setState({companyList});
    }

    renderWatchlist = () => {
        const {companyList, watchlistData, averagePriceChange, weeksArr, chartWidth} = this.state;
        if( !companyList || !watchlistData || !watchlistData.length ) {
            return null;
        }
        const masterCheckboxValue = watchlistData.find(item => !item.checked) ? false : true;
        const priceChangeRange = [];
        for (const w of weeksArr) {
            const priceChangeArr = watchlistData.map(item => Number(item.priceChange[w]));
            const max = _.max(priceChangeArr);
            const min = _.min(priceChangeArr);
            priceChangeRange.push([min, max]);
        }
        // watchlistData.map(item => item.priceChange)
    
        const html = watchlistData.map((item, index) => {
            if (this.state.compare && !item.checked) {
                return null;
            }
            return (
                <WatchlistRow
                    key={item.name}
                    weeksArr={this.state.weeksArr}
                    chartWidth={this.state.chartWidth}
                    index={index}
                    item={item}
                    company={companyList[index]}
                    updateCompany={(key, value) => this.updateCompany(index, key, value)}
                    handleCheckboxChange={(e) => this.handleCheckboxChange(e, index)}
                    renderChart={this.renderChart}
                    removeStock={this.removeStock}
                    moveStock={(targetWatchlistId) => this.moveStock(index, targetWatchlistId)}
                    priceChangeRange={priceChangeRange}
                />
            );
        });
        return (
            <table className="table table-stripped">
                <thead>
                    <tr>
                        <th>
                            <Form.Check type='checkbox' checked={masterCheckboxValue} onChange={this.handleCheckboxChange} />    
                        </th>
                        <th><span onClick={() => this.sortBy('color')}>Color</span></th>
                        <th><span onClick={() => this.sortBy('score', true)}>Score</span></th>
                        <th style={{width: '20%'}}>
                            <span onClick={() => this.sortBy('name')}>Company</span>
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
        if (!(this.props.common.users || []).length) {
            return null;
        }
        const count = (this.state.companyList || []).length;
        const activeWatchlist = this.props.common.activeWatchlist || {};
        return (
            <div>
                <h4>{activeWatchlist.name} Watchlist ({count} stocks)</h4>
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
    common: state.common,
    activeWatchlist: state.common.activeWatchlist
})

const mapDispatchToProps = {
    getWatchlistData,
    getActiveWatchlistData,
    setCompareList,
    getComparisionListData,
    setError,
    getAllWatchlists,
    removeCompany,
    moveCompany
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(Watchlist);

export default connectedComponent;
