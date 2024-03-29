import React, { PureComponent } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

const getOptionTotal = (arr) => {
    const min = 0;
    const max = 12;
    if (!arr) return null;
    let total = 0;
    for (let i=min; i<max; i++) {
        total +=arr[i];
    }
    return total;
};

const getOptionTotal2 = (arr) => {
    const min = 6;
    const max = 12;
    if (!arr) return null;
    let total = 0;
    for (let i=min; i<max; i++) {
        total +=arr[i];
    }
    return total;
};

const getOptionTotal3 = (arr) => {
    const min = 0;
    const max = 6;
    if (!arr) return null;
    let total = 0;
    for (let i=min; i<max; i++) {
        total +=arr[i];
    }
    return total;
};

let counter = 0;

export default class OptionData extends PureComponent {
    constructor() {
        super();
        this.state = {
            type: 'nifty',
            stockSymbol: 'RELIANCE',
            selectedTimeIndex: 2
        };
        this.getApiData();
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

    getApiData = async() => {
        this.setState({ apiSuccess: false });
        const { type, stockSymbol } = this.state;
        const dynamicQs = type === 'stock' ? `&stockSymbol=${stockSymbol}` : '';
        const apiUrl = `http://localhost:8080/api/getOptionData?type=${this.state.type}`;
        const apiUrl2 = `http://localhost:8080/api/getOptionDataArray?type=${this.state.type}${dynamicQs}`;
        Promise.all([axios.get(apiUrl), axios.get(apiUrl2)]).then((response) => {
            this.apiData = response[0].data;
            this.apiData2 = response[1].data;
            this.setState({ apiSuccess: true });
        },(err1, err2) => {
            console.log('Error in API', err1, err2);
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

    renderChart = () => {
        const _this = this;
        const options = {
            chart: {
                height: '1200',
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
                useUTC: false
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
                text: `Live ${this.state.type} ${this.state.type === 'stock' ? `${this.state.stockSymbol}` : ''} option data`
            },
        
            exporting: {
                enabled: false
            },
        
            series: [{
                name: 'call data',
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData2.length; i += 1) {
                        if (_this.apiData2[i]) {
                            const time = Number(_this.apiData2[i].timestamp);
                            // const callTotal = Number(_this.apiData[i].putTotal) - Number(_this.apiData[i].callTotal);
                            // const callTotal = Number(_this.apiData[i].callTotal);
                            const callTotal = getOptionTotal(_this.apiData2[i].callArray);
                            data.push([
                                time,
                                callTotal / 2,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'put data',
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData2.length; i += 1) {
                        if (_this.apiData2[i]) {
                            const time = Number(_this.apiData2[i].timestamp);
                            // const putTotal = 3 * Number(_this.apiData[i].putTotal);
                            const putTotal = getOptionTotal(_this.apiData2[i].putArray);
                            data.push([
                                time,
                                putTotal / 2,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
            //     name: 'call + put data',
            //     data: (function () {
            //         var data = [];
            //         if (!_this.apiData) {
            //             return data;
            //         }
            //         for (var i = 0; i <= _this.apiData.length; i += 1) {
            //             if (_this.apiData[i]) {
            //                 const time = Number(_this.apiData[i].timestamp);
            //                 const putTotal = Number(_this.apiData[i].callTotal) + Number(_this.apiData[i].putTotal);
            //                 data.push([
            //                     time,
            //                     putTotal,
            //                 ]);
            //             }
            //         }
            //         return data;
            //     }())
            // },{
                name: 'call - put data',
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData2.length; i += 1) {
                        if (_this.apiData2[i]) {
                            const time = Number(_this.apiData2[i].timestamp);
                            // const total = Number(_this.apiData[i].callTotal) - Number(_this.apiData[i].putTotal);
                            const total = getOptionTotal(_this.apiData2[i].callArray) - getOptionTotal(_this.apiData2[i].putArray);
                            data.push([
                                time,
                                total,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'call - put data - 2',
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData.length; i += 1) {
                        if (_this.apiData2[i]) {
                            const time = Number(_this.apiData2[i].timestamp);
                            // const total = Number(_this.apiData[i].callTotal2) - Number(_this.apiData[i].putTotal2);
                            const total = getOptionTotal2(_this.apiData2[i].callArray) - getOptionTotal2(_this.apiData2[i].putArray);
                            data.push([
                                time,
                                total,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'call - put data - 3',
                yAxis: 0,
                data: (function () {
                    var data = [];
                    if (!_this.apiData2) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData2.length; i += 1) {
                        if (_this.apiData2[i]) {
                            const time = Number(_this.apiData2[i].timestamp);
                            // const total = Number(_this.apiData[i].callTotal2) - Number(_this.apiData[i].putTotal2);
                            const total = getOptionTotal3(_this.apiData2[i].callArray) - getOptionTotal3(_this.apiData2[i].putArray);
                            data.push([
                                time,
                                total,
                            ]);
                        }
                    }
                    return data;
                }())
            // },{
            //     name: _this.state.type.toUpperCase(),
            //     yAxis: 1,
            //     data: (function () {
            //         var data = [];
            //         if (!_this.apiData2) {
            //             return data;
            //         }
            //         for (var i = 0; i <= _this.apiData2.length; i += 1) {
            //             if (_this.apiData2[i]) {
            //                 const time = Number(_this.apiData2[i].timestamp);
            //                 const underlyingValue = Number(_this.apiData2[i].underlyingValue);
            //                 data.push([
            //                     time,
            //                     underlyingValue,
            //                 ]);
            //             }
            //         }
            //         return data;
            //     }())
            }],
            yAxis: [{}, {}]
        };
        return (
            <div style={{height: '800px'}}>
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
                <div dangerouslySetInnerHTML={{__html: this.state.nseHtml}}></div>
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
                {this.state.apiSuccess && this.renderChart()}
            </div>
        );
    }
}