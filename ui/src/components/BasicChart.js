import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const defaultTimeFrame = 90;

class ChartRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeframe: true
    }
  }

  getSeriesData(stockData) {
    const seriesData = [];
    if (!this.state.timeframe) {
      seriesData.push({ type: 'spline', name: `price`, data: stockData.price });
      seriesData.push({ type: 'column', name: `volume`, data: stockData.volume, yAxis: 1 });
    } else {
      // take last n entries
      const stateIndex = stockData.price.length - defaultTimeFrame;
      seriesData.push({ type: 'spline', name: `price`, data: stockData.price.slice(stateIndex) });
      seriesData.push({ type: 'column', name: `volume`, data: stockData.volume.slice(stateIndex), yAxis: 1 });
    }
    return seriesData;
  }

  changeTimeframe = () => {
    this.setState({timeframe: !this.state.timeframe});
  }

  render() {
    const options = {
      chart: {
        height: '200px',
      },
      legend: {
        // align: 'center',
        // verticalAlign: 'bottom',
        // layout: 'vertical',
        // x: -50,
        enabled: false
      },
      yAxis: [{
        title: {
          text: false,
          visible: false
        },
      },{
        title: {
          text: false,
          visible: false
        },
        opposite: true
      }],
      labels: {
          visible: false
      },
      title: {
        text: '',
      },
      series: this.getSeriesData(this.props.processedData),
    };

    return (<div style={{position: 'relative'}}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        key={this.props.key}
      />
      <button
        style={{
          position: 'absolute',
          bottom: 0,
          padding: '8px',
          lineHeight: 0,
          background: '#00b8ff',
          borderRadius: '5px',
          width: '28px'
        }}
        onClick={this.changeTimeframe}
      >
        {this.state.timeframe ? '-' : '+'}
      </button>
    </div>)
  }
}

export default ChartRender;