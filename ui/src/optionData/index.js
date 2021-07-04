import React, { PureComponent } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

const url = 'http://localhost:8080/api/getOptionData';

export default class OptionData extends PureComponent {
    constructor() {
        super();
        this.state = {
            type: 'nifty',
        };
        this.getApiData(url);
    }

    getApiData = async(apiUrl) => {
        this.setState({ apiSuccess: false });
        const response = await axios.get(apiUrl);
        this.apiData = response.data;
        this.setState({ apiSuccess: true });
    }

    updateChart = (type) => {
        this.setState({ type });
        const apiUrl = `${url}?type=${type}`;
        this.getApiData(apiUrl)
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

    renderChart = () => {
        const _this = this;
        const options = {
            chart: {
                height: 680,
                events: {
                    load: function() {
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
                    count: 5,
                    type: 'day',
                    text: '5D'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 2,
            },
        
            title: {
                text: 'Live Bank nifty data'
            },
        
            exporting: {
                enabled: false
            },
        
            series: [{
                name: 'call data',
                data: (function () {
                    var data = [];
                    if (!_this.apiData) {
                        return data;
                    }
                        // time = (new Date()).getTime(),
                    // var time = new Date();
                    // time.setDate(time.getDate() - 1);
                    for (var i = 0; i <= _this.apiData.length; i += 1) {
                        if (_this.apiData[i]) {
                            const time = Number(_this.apiData[i].timestamp);
                            // const callTotal = Number(_this.apiData[i].putTotal) - Number(_this.apiData[i].callTotal);
                            const callTotal = Number(_this.apiData[i].callTotal);
                            data.push([
                                time,
                                callTotal,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'put data',
                data: (function () {
                    var data = [];
                    if (!_this.apiData) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData.length; i += 1) {
                        if (_this.apiData[i]) {
                            const time = Number(_this.apiData[i].timestamp);
                            const putTotal = Number(_this.apiData[i].putTotal);
                            data.push([
                                time,
                                putTotal,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'call + put data',
                data: (function () {
                    var data = [];
                    if (!_this.apiData) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData.length; i += 1) {
                        if (_this.apiData[i]) {
                            const time = Number(_this.apiData[i].timestamp);
                            const putTotal = Number(_this.apiData[i].callTotal) + Number(_this.apiData[i].putTotal);
                            data.push([
                                time,
                                putTotal,
                            ]);
                        }
                    }
                    return data;
                }())
            },{
                name: 'call - put data',
                data: (function () {
                    var data = [];
                    if (!_this.apiData) {
                        return data;
                    }
                    for (var i = 0; i <= _this.apiData.length; i += 1) {
                        if (_this.apiData[i]) {
                            const time = Number(_this.apiData[i].timestamp);
                            const putTotal = Number(_this.apiData[i].callTotal) - Number(_this.apiData[i].putTotal);
                            data.push([
                                time,
                                putTotal,
                            ]);
                        }
                    }
                    return data;
                }())
            }]
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
                <button style={{ fontWeight: this.state.type === 'nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('nifty')}>Nifty</button>
                <button style={{ fontWeight: this.state.type === 'bank_nifty' ? 'bold' : 'auto' }} onClick={() => this.updateChart('bank_nifty')}>Bank Nifty</button>
                {!this.state.apiSuccess && <div>
                    Loading...
                </div>}
                {this.state.apiSuccess && this.renderChart()}
            </div>
        );
    }
}