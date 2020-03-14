import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class ChartRender extends Component {

  categoriesGenerator() {
    let category = []
    this.props.processedData.forEach(company => {
      category = company.map(item=>item.date)
    });
    return category;
  }

  getSeriesData(stockData, name) {
    const seriesData = [];
    const type = this.props.chartType;
    switch (type) {
      case 'line':
      case 'spline':
      case 'bar': {
        const priceData = stockData.map((item) => item.price);
        seriesData.push({ type, name: `${name}_price`, data: priceData });
        
        const volumeData = stockData.map((item) => item.volume);
        seriesData.push({ type: 'column', name: `${name}_volume`, data: volumeData, yAxis: 1 });
        
        const revenueData = stockData.map((item) => item.revenue);
        seriesData.push({ type: 'column', name: `${name}_revenue`, data: revenueData, yAxis: 2 });

        const profitData = stockData.map((item) => item.profit);
        seriesData.push({ type: 'spline', name: `${name}_profit`, data: profitData, yAxis: 3, connectNulls: true });
        break;
      }
      
      case 'combined': {
        const data = stockData.map(val => Number(val.price));
        seriesData.push({ type: 'line', name, data });
        seriesData.push({ type: 'column', name, data });
        break;
      }
    }
    return seriesData;
  }

  getData() {
    const seriesData = [];
    this.props.processedData.forEach((element, index) => {
      const name = this.props.compareList[index].name;
      seriesData.push(this.getSeriesData(element, name));
    });
    const finalData = [];
    seriesData.forEach(i => {
      i.forEach(j => {
        finalData.push(j);
      })
    });
    return finalData;
  }

  render() {
    const title = this.props.compareList.length === 1 ? `Chart for ${this.props.compareList[0].name}` : `Comparision chart`;
    const options = {
      // chart: {
      //   marginRight: 260,
      //   marginLeft: 260
      // },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'vertical',
        x: -50,
      },
      yAxis: [{
        title: {
          text: 'Price'
        },
      },{
        title: {
          text: 'Volume'
        },
        opposite: true
      },{
        title: {
          text: 'Revenue'
        },
      },{
        title: {
          text: 'Profit'
        },
        opposite: true
      }],
      xAxis: {
        title: {
          text: 'date'
        },
        categories: this.categoriesGenerator()
      },
      labels: {
        items: [{
          style: {
            left: '50px',
            top: '18px',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
          }
        }]
      },
      title: {
        text: title
      },
      series: this.getData(),
    };

    return (<div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>)
  }
}

export default ChartRender;