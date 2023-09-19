
import React from 'react';
import { connect } from 'react-redux';
import './App.css';
import Navigation from './common/components/Navigation';
import WatchlistToggler from './common/components/WatchlistToggler';
import Company from './company';
import Watchlist from './watchlist';
import OptionData from './optionData';
import OptionDataTotal from './optionData/optionDataTotal';
import OptionChain from './optionData/optionChain';
import AdTimer from './adTimer';
// import Comparision from './comparision';
import User from './user';
import Loader from './common/components/loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import ErrorBar from './common/components/ErrorBar';
import './common/styles/common.css';
import './common/styles/common.scss';

import { BrowserRouter, Route } from 'react-router-dom';
import Portfolio from './components/Portfolio';


function App({ common }) {
  return (
    <div className="App">
      <Loader show={common.showLoader} />
      <BrowserRouter>
        <WatchlistToggler />
        <Navigation />
        <ErrorBar />
        {/* <div className="container"> */}
        <div className="">
          <Route exact path="/" component={Company} />
          <Route path="/company" component={Company} />
          <Route path="/watchlist" component={Watchlist} />
          <Route path="/optionData" component={OptionData} />
          <Route path="/optionDataTotal" component={OptionDataTotal} />
          <Route path="/optionChain" component={OptionChain} />
          <Route path="/ad-timer" component={AdTimer} />
          <Route path="/portfolio" component={Portfolio} />
          {/* <Route path="/comparision" component={Comparision} /> */}
          <Route path="/user" component={User} />
        </div>
      </BrowserRouter>
    </div>
  );
}

const mapStateToProps = (state) => ({ common: state.common });

export default connect(mapStateToProps, null)(App);

