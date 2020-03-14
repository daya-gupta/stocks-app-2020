import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class ChartRender extends Component {

  getSeriesData(stockData) {
    const seriesData = [];
    seriesData.push({ type: 'spline', name: `price`, data: stockData.price });
    seriesData.push({ type: 'column', name: `volume`, data: stockData.volume, yAxis: 1 });
    return seriesData;
  }

  render() {
    const options = {
      chart: {
        // marginRight: 260,
        // marginLeft: 260
        height: 100
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
    //   xAxis: {
    //     title: {
    //       text: 'date'
    //     },
    //     categories: this.categoriesGenerator()
    //   },
      labels: {
          visible: false
        // items: [{
        //   style: {
        //     left: '50px',
        //     top: '18px',
        //     color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
        //   }
        // }]
      },
      title: {
        text: '',
      },
      series: this.getSeriesData(this.props.processedData),
    };

    return (<div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        key={this.props.key}
      />
    </div>)
  }
}

export default ChartRender;