import React, { PureComponent } from 'react';
import Highcharts, { isArray } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

// const getOptionTotal = (arr) => {
//     const min = 0;
//     const max = 12;
//     if (!arr) return null;
//     let total = 0;
//     for (let i=min; i<max; i++) {
//         total +=arr[i];
//     }
//     return total;
// };

// const getOptionTotal2 = (arr) => {
//     const min = 6;
//     const max = 12;
//     if (!arr) return null;
//     let total = 0;
//     for (let i=min; i<max; i++) {
//         total +=arr[i];
//     }
//     return total;
// };

// const getOptionTotal3 = (arr) => {
//     const min = 0;
//     const max = 6;
//     if (!arr) return null;
//     let total = 0;
//     for (let i=min; i<max; i++) {
//         total +=arr[i];
//     }
//     return total;
// };

let counter = 0;

export default class OptionChain extends PureComponent {
    localData = {
        fromDate: null,
        toDate: null
    }
    constructor() {
        super();
        this.state = {
            type: 'nifty',
            stockSymbol: 'RELIANCE',
            selectedTimeIndex: 2,
        };
        this.getApiData();
        this.apiData2 = [];
        // setInterval(this.getApiData, 1 * 60 * 1000);
        // this.getNseHtml('http://localhost:8080/api/getNseHtml');
    }

    componentDidMount = () => {
        var source = new EventSource('http://localhost:8080/api/countdown')

        source.addEventListener('message', (e) => {
            // document.getElementById('data').innerHTML = e.data
            try {
                const data = JSON.parse(e.data);
                console.log('message', data, ++counter);
                // this.updateSeries(data);
                // this.getApiData();
            } catch(err) {
                console.log('error in new point ', err);
            }
        })

        source.addEventListener('open', function(e) {
            // document.getElementById('state').innerHTML = "Connected";
            console.log('connected');
        }, false)

        source.addEventListener('error', (e) => {
            // const id_state = document.getElementById('state')
            if (e.eventPhase == EventSource.CLOSED)
                source.close()
            if (e.target.readyState == EventSource.CLOSED) {
                // id_state.innerHTML = "Disconnected"
                console.log('disconnected');
            } else if (e.target.readyState == EventSource.CONNECTING) {
                // id_state.innerHTML = "Connecting..."
                console.log('connecting');
            }
        })
    }

    // getNseHtml = async(apiUrl) => {
    //     // this.setState({ apiSuccess: false });
    //     const response = await axios.get(apiUrl);
    //     console.log(response.data);
    //     // this.setState({ nseHtml: response.data })
    //     // this.apiData = response.data;
    //     // this.setState({ apiSuccess: true });
    // }
    
    // getApiData = async(apiUrl) => {
    //     this.setState({ apiSuccess: false });
    //     const response = await axios.get(apiUrl);
    //     this.apiData = response.data;
    //     this.setState({ apiSuccess: true });
    // }
    getFormattedDate = (d, start) => {
        return start ? d : `${d}T23:59:59Z`;
    }

    getApiData = async() => {
        this.setState({ apiSuccess: false });
        const { type, stockSymbol } = this.state;
        const dynamicQs = type === 'stock' ? `&stockSymbol=${stockSymbol}` : '';
        const fromDate = this.getFormattedDate(this.localData.fromDate, 0);
        const toDate = this.getFormattedDate(this.localData.toDate, 1);
        if (!fromDate || !toDate) {
            return false;
        }
        // const apiUrl = `http://localhost:8080/api/getOptionData?type=${this.state.type}`;
        // const apiUrl2 = `http://localhost:8080/api/getOptionDataArray?type=${this.state.type}${dynamicQs}`;
        // Promise.all([axios.get(apiUrl), axios.get(apiUrl2)]).then((response) => {
        //     this.apiData = response[0].data;
        //     this.apiData2 = response[1].data;
        //     this.setState({ apiSuccess: true });
        // },(err1, err2) => {
        //     console.log('Error in API', err1, err2);
        //     this.setState({ apiSuccess: true });
        // })

        const apiUrl = `http://localhost:8080/api/getOptionDataArray?type=${this.state.type}${dynamicQs}&fromDate=${fromDate}&toDate=${toDate}`;
        Promise.all([axios.get(apiUrl)]).then((response) => {
            this.apiData2 = response[0].data.slice();
            this.setState({ apiSuccess: true });
        },(err) => {
            console.log('Error in API', err);
            this.setState({ apiSuccess: true });
        })

        // const response = await axios.get(apiUrl);
        // this.apiData = response.data;
        // this.setState({ apiSuccess: true });
    }

    updateChart = (type, stockSymbol) => {
        this.setState({ type });
        if (stockSymbol) {
            this.setState({ stockSymbol })
        }
        // const apiUrl = `${url}?type=${type}`;
        // this.getApiData(apiUrl);
        setTimeout(this.getApiData);
    }

    // update = async (_this, series, all) => {
    //     const response = await axios.get(url);
    //     const optionData = response.data;
    //     if (!all) {
    //         optionData.slice(0, 10).forEach(lastItem => {
    //             setTimeout((item) => {
    //                 const time = Number(item.timestamp);
    //                 const callTotal = Number(item.callTotal);
    //                 series[0].addPoint([time, callTotal], true, true);
    //             }, 100, lastItem)
    //         })
    //     } else {
    //         const lastItem = optionData.pop();
    //         const time = new Date(Number(lastItem.timestamp));
    //         series[0].addPoint([time, Number(lastItem.callTotal)], true, true);
    //         series[1].addPoint([time, Number(lastItem.putTotal)], true, true);
    //     }
    //     // var x = (new Date()).getTime(), // current time
    //     //     y = Math.round(Math.random() * 100);
    //     // series.addPoint([x, y], true, true);
    // }

    // updateSeries = (newPoint) => {
    //     const { underlyingValue, timestamp, type } = newPoint;
    //     if (type !== this.state.type) return;
    //     let { callArray, putArray } = newPoint;
    //     callArray = JSON.parse(callArray);
    //     putArray = JSON.parse(putArray);
        
    //     const callTotal = getOptionTotal(callArray);
    //     const putTotal = getOptionTotal(putArray);
    //     const total = getOptionTotal(callArray) - getOptionTotal(putArray);
    //     const total2 = getOptionTotal2(callArray) - getOptionTotal2(putArray);
    //     const total3 = getOptionTotal3(callArray) - getOptionTotal3(putArray);
    //     this.series[0].addPoint(timestamp, callTotal);
    //     this.series[1].addPoint(timestamp, putTotal);
    //     this.series[2].addPoint(timestamp, total);
    //     this.series[3].addPoint(timestamp, total2);
    //     this.series[4].addPoint(timestamp, total3);
    //     this.series[5].addPoint(timestamp, Number(underlyingValue));
    //     this.redraw();
    // }

    renderChart = (seriesType, seriesIndex) => {
        const _this = this;
        const options = {
            chart: {
                // height: '540',
                // width: '540',
                events: {
                    load: function() {
                        console.log('hi');
                        _this.series = this.series;
                        _this.redraw = this.redraw;
                        // set up the updating of the chart each second
                        // var series = this.series;
                        // setTimeout(
                        //     () => _this.update(this, series),
                        //     3000
                        // );
                        // setInterval(
                        //     () => _this.update(this, series),
                        //     3000 * 60
                        // );
                    }
                }
            },
        
            time: {
                useUTC: false,
                timezoneOffset: 5.5 * 60
            },
        
            rangeSelector: {
                buttons: [{
                    count: 15,
                    type: 'minute',
                    text: '15 Min'
                }, {
                    count: 1,
                    type: 'hour',
                    text: '1H'
                }, {
                    count: 3,
                    type: 'hour',
                    text: '3H'
                }, {
                    count: 1,
                    type: 'day',
                    text: '1D',
                }, {
                    count: 2,
                    type: 'day',
                    text: '2D'
                }, {
                    count: 3,
                    type: 'day',
                    text: '3D'
                }, {
                    count: 5,
                    type: 'day',
                    text: '5D'
                }, {
                    count: 15,
                    type: 'day',
                    text: '15D'
                }, {
                    count: 30,
                    type: 'day',
                    text: '30D'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: this.state.selectedTimeIndex,
            },
        
            title: {
                // text: `${this.state.type} ${this.state.type === 'stock' ? `${this.state.stockSymbol}` : ''} ${ seriesType } data`
                text: (() => {
                    // return 'test'
                    if (!_this.apiData2.length) {
                        return '';
                    }
                    if (seriesType === 'SPOT') {
                        return `${this.state.type} ${this.state.type === 'stock' ? `${this.state.stockSymbol}` : ''} ${seriesType}`;
                    }
                    const lastIndex = _this.apiData2.length - 1;
                    const underlyingValue = _this.apiData2[lastIndex].underlyingValue;
                    const baseValue = Math.floor(underlyingValue/100) * 100;
                    const baseIndex = _this.apiData2[lastIndex].strikeArray.findIndex(item => item === baseValue);                    
                    const targetIndex = baseIndex - 1 + seriesIndex;
                    const targetStrike = _this.apiData2[lastIndex].strikeArray[targetIndex];
                    return `${this.state.type} ${this.state.type === 'stock' ? `${this.state.stockSymbol}` : ''} ${seriesType} - ${targetStrike}`;
                })()
            },
        
            exporting: {
                enabled: false
            },
        
            series: [{
                name: `${seriesType} - ${seriesIndex}`,
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2.length) {
                        return data;
                    }
                    const underlyingValue = _this.apiData2[_this.apiData2.length - 1].underlyingValue;
                    const baseValue = Math.floor(underlyingValue/100) * 100;
                    
                    for (var i = 0; i <= _this.apiData2.length; i += 1) {
                        if (_this.apiData2[i]) {
                            // const time = Number(_this.apiData2[i].timestamp);
                            const time = _this.apiData2[i].timestamp;
                            if (seriesType === 'SPOT') {
                                const spot = _this.apiData2[i].underlyingValue;
                                data.push([
                                    new Date(time).toLocaleString({timeZone: 'Asia/Kolkata'}),
                                    +spot || null,
                                ]);
                            }
                            else {
                                const targetSeries = seriesType === 'CE' ? _this.apiData2[i].callArray : _this.apiData2[i].putArray;                            
                                const baseIndex = _this.apiData2[i].strikeArray.findIndex(item => item === baseValue);
                                const targetIndex = baseIndex - 1 + seriesIndex
                                const openInterest = targetSeries[targetIndex];
                                data.push([
                                    new Date(time).toLocaleString({ timeZone: 'Asia/Kolkata' }),
                                    openInterest,
                                ]);
                            }
                        }
                    }
                    return data;
                }())
            }],
            yAxis: [{}, {}]
        };
        return (
            <div style={{height: '500px', width: '380px', display: 'inline-block'}}>
                <HighchartsReact
                    highcharts={Highcharts}
                    constructorType='stockChart'
                    options={options}
                />
            </div>
        );
    }

    render() {
        return (
            <div>
                <div>
                    From:
                    <input type="date" onChange={(e) => { this.localData.fromDate = e.target.value }} />
                    To:
                    <input type="date" onChange={(e) => { this.localData.toDate = e.target.value }} />
                    <button onClick={this.getApiData}>UpdateData</button>
                </div>
                <div dangerouslySetInnerHTML={{__html: this.state.nseHtml}}></div>
                <div>Nifty Spot: {this.apiData2[this.apiData2.length - 1]?.underlyingValue}</div>
                <div style={{height: 0, overflow: 'visible', float: 'right', zIndex: 9, position: 'relative', right: '220px'}}>
                    <button style={{ fontWeight: this.state.type === 'nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('nifty')}>Nifty</button>
                    <button style={{ fontWeight: this.state.type === 'bank_nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('bank_nifty')}>Bank Nifty</button>
                    <button style={{ fontWeight: this.state.type === 'bank_nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('stock')}>Stock</button>
                </div>
                <div style={{height: 0, overflow: 'visible', float: 'right', zIndex: 9, position: 'relative'}}>
                    <button style={{ fontWeight: this.state.type === 'nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('stock', 'RELIANCE')}>RELIANCE</button>
                    <button style={{ fontWeight: this.state.type === 'bank_nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('stock', 'TCS')}>TCS</button>
                    <button style={{ fontWeight: this.state.type === 'bank_nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('stock', 'SRF')}>SRF</button>
                </div>
                {!this.state.apiSuccess && <div>
                    Loading...
                </div>}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                {this.state.apiSuccess && this.renderChart('SPOT', 0)}
                
                {this.state.apiSuccess && this.renderChart('CE', -1)}
                {this.state.apiSuccess && this.renderChart('CE', 0)}
                {this.state.apiSuccess && this.renderChart('CE', 1)}
                {this.state.apiSuccess && this.renderChart('CE', 2)}
                {this.state.apiSuccess && this.renderChart('CE', 3)}
                {this.state.apiSuccess && this.renderChart('CE', 4)}
                {this.state.apiSuccess && this.renderChart('CE', 5)}
                {/* {this.state.apiSuccess && this.renderChart('CE', 5)} */}

                {this.state.apiSuccess && this.renderChart('PE', -1)}
                {this.state.apiSuccess && this.renderChart('PE', 0)}
                {this.state.apiSuccess && this.renderChart('PE', 1)}
                {this.state.apiSuccess && this.renderChart('PE', 2)}
                {this.state.apiSuccess && this.renderChart('PE', 3)}
                {this.state.apiSuccess && this.renderChart('PE', 4)}
                {this.state.apiSuccess && this.renderChart('PE', 5)}
                {/* {this.state.apiSuccess && this.renderChart('PE', 5)} */}
            </div>
        );
    }
}