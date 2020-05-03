import React, { Component} from 'react';
import { connect } from 'react-redux';
import '../common/styles/company.css';
import Typeahead from '../common/components/typeahead';
import { getHistoricalData, searchCompany, getConsolidatedData, addCompany } from './action';
import { setError, getAllWatchlists } from '../common/actions/commonActions';
import ChartRender from '../components/chartRender';
import { processHistoricalData, getActiveWatchlistData, setActiveWatchlistData } from '../common/util';
import { durationOptions } from '../common/constants';
// import { durationOptions, watchlistName } from '../common/constants';
// import ErrorBar from '../common/components/ErrorBar';

class Company extends Component {
    state = {
        selectedCompany: { companyId: 3365, name: 'Tata Consultancy Services Ltd', url: '/company/TCS/consolidated/' },
        historicalData: [],
        consolidatedData: [],
        duration: 1080,
        chartType: 'spline'
    };

    componentDidMount() {
        const activeWatchlist = this.props.common.activeWatchlist;
        if (!activeWatchlist) {
            this.props.getAllWatchlists();
        }
        const duration = this.state.duration;
        const companyId = this.state.selectedCompany.companyId;
        const url = this.state.selectedCompany.url;
        this.props.getHistoricalData({companyId, duration}, this.historicalDataCallback);
        this.props.getConsolidatedData({url}, this.consolidatedDataCallback);
    }
    
    historicalDataCallback = (data) => {
        this.setState({ historicalData: data });
    }

    consolidatedDataCallback = (data) => {
        this.setState({ consolidatedData: data });
    }

    selectCompany = (selection) => {
        selection.companyId = selection.id;
        delete selection.id;
        this.setState({ selectedCompany: selection });
        const duration = this.state.duration;
        const companyId = selection.companyId;
        const url = selection.url;
        this.props.getHistoricalData({companyId, duration}, this.historicalDataCallback);
        this.props.getConsolidatedData({url}, this.consolidatedDataCallback);
    }

    renderChart = () => {
        const priceData = this.state.historicalData;
        const consolidatedData = this.state.consolidatedData;
        const chartData = processHistoricalData(priceData, consolidatedData);
        return (
            <ChartRender chartType={this.state.chartType} processedData = {[chartData]} compareList = {[this.state.selectedCompany]}/>
        );
    }

    // addToWatchlist = () => {
    //     const selectedCompany = this.state.selectedCompany;
    //     const watchlistData = getActiveWatchlistData();
    //     let errorMessage = null;
    //     // validate watchlist and selected company
    //     // if (!selectedCompany || watchlistName) {
    //     //     errorMessage = 'No stock selected!! or no watchlist exist!!';
    //     // } else {
    //         if (watchlistData.companies.filter(item => item.id === selectedCompany.id).length === 0) {
    //             watchlistData.companies.push(selectedCompany);
    //             setActiveWatchlistData(watchlistData);
    //             errorMessage = 'Stock added successfully';
    //         } else {
    //             errorMessage = 'Stock already exist in the watchlist';
    //         }
    //     // }
    //     const error = { message: errorMessage };
    //     this.props.setError(error);
    // }

    addToWatchlist = () => {
        const selectedCompany = this.state.selectedCompany;
        selectedCompany.watchlistId = this.props.common.activeWatchlist._id;
        const error = { message: '' };
        this.props.addCompany(selectedCompany, (res, err) => {
            if (err) {
                error.message = err.error;
            } else {
                error.message = 'Stock added successfully';
            }
        });
        this.props.setError(error);
    }

    changeDuration = (duration) => {
        this.setState({ duration });
        const companyId = this.state.selectedCompany.companyId;
        this.props.getHistoricalData({companyId, duration}, this.historicalDataCallback);
    }

    renderDuration = () => {
        return (<div className="btn-group pull-left mr-2 mb-2" role="group" aria-label="Basic example">
            {durationOptions.map(item => {
                const customClass = this.state.duration === item.id ? 'active' : ''; 
                return (
                    <button type="button" className={`btn btn-secondary ${customClass}`} disabled={!this.state.selectedCompany} onClick={() => this.changeDuration(item.id)}>{item.label}</button>
                )
            })}
        </div>);
    }

    render = () => {
        return (
            <div id="company">
                <div className="row ml-4 mr-4 mt-5 mb-5">
                    <div className="col-md-12 col-lg-8 company-actions">
                        {this.renderDuration()}
                        {this.state.selectedCompany && <button className="btn btn-primary pull-left mb-2" onClick={this.addToWatchlist}>Add to watchlist</button>}
                    </div>
                    <div className="col-md-12 col-lg-4">
                        <Typeahead searchCompany={this.props.searchCompany} selectCompany={this.selectCompany} />
                    </div>
                </div>
                <div className="col-12">
                    {this.renderChart()}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    company: state.company,
    common: state.common
})

const mapDispatchToProps = {
    getHistoricalData,
    getConsolidatedData,
    searchCompany,
    setError,
    addCompany,
    getAllWatchlists,
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(Company);

export default connectedComponent;