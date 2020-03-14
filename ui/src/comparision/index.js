import React from 'react';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'
import ComparisionChart from '../components/ComparisionChart';
import { getComparisionListData } from './action'
import { getWatchlistData } from '../watchlist/actions'
// import { watchlistName } from '../common/constants';
import { getStorageData } from '../common/util';

const chartTypes = ['line', 'spline', 'bar', 'combined'];

class Comparision extends React.Component {
    constructor (props) {
        super(props);
        const watchlist = getStorageData().watchlistData.activeWatchlistIndex;
        this.compareList = watchlist.filter(item => item.checked ? item : false);
        this.state = {
            compareStocksData: [],
            chartType: 'spline'
        }
    }

    componentDidMount() {
        this.props.getComparisionListData(this.compareList, (compareListData) => {
            const compareStocksData = [];
            compareListData.forEach((data) => {
                const processedData = []
                for (let index = 0; index < data.quarter.length; index++) {
                    const date = data.quarter[index];
                    const revenue = Number(data.revenue[index]);
                    const profit = Number(data.profit[index]);
                    processedData.push({ date, revenue, profit });
                }
                compareStocksData.push(processedData)
            });
            this.setState({ compareStocksData });
        });
    }
    renderCompareListChart() {
        if (!this.compareList || !this.compareList.length) {
            return null;
        }
        return (<ComparisionChart chartType={this.state.chartType} processedData={this.state.compareStocksData} compareList={this.compareList}></ComparisionChart>);
    }
    renderChartType = () => {
        return (
            <DropdownButton id="dropdown-item-button" title="Chart-Type" variant='primary' size='md'>
                {chartTypes.map(chartType => (
                    <Dropdown.Item
                        as="button"
                        onClick={() => this.setState({ chartType })}
                    >
                        {`${chartType.toUpperCase()}-Chart`}
                    </Dropdown.Item>))
                }
            </DropdownButton>
        );
    }
    render = () => (
        <div>
            {this.compareList.length === 0 ? 'Please select companies from watchlist' : '' }
            {this.renderChartType()}
            {this.renderCompareListChart()}
        </div>
    )
}

const mapStateToProps = (state) => ({
    comparision: state.comparision,
    common: state.common

})

const mapDispatchToProps = {
    getComparisionListData,
    getWatchlistData
};

const combinedStocks = connect(mapStateToProps, mapDispatchToProps)(Comparision);

export default combinedStocks;