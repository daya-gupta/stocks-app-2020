// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

import React from 'react';
import { connect } from 'react-redux';
import './App.css';
import Navigation from './common/components/Navigation';
import WatchlistToggler from './common/components/WatchlistToggler';
import Company from './company';
import Watchlist from './watchlist';
// import Comparision from './comparision';
import Loader from './common/components/loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import ErrorBar from './common/components/ErrorBar';
import './common/styles/common.css';
import './common/styles/common.scss';

import { BrowserRouter, Route } from 'react-router-dom';


function App({ common }) {
  return (
    <div className="App">
      {common.showLoader && <Loader />} 
      <BrowserRouter>
        <WatchlistToggler />
        <Navigation />
        <ErrorBar />
        {/* <div className="container"> */}
        <div className="">
          <Route exact path="/" component={Company} />
          <Route path="/company" component={Company} />
          <Route path="/watchlist" component={Watchlist} />
          {/* <Route path="/comparision" component={Comparision} /> */}
        </div>
      </BrowserRouter>
    </div>
  );
}

const mapStateToProps = (state) => ({ common: state.common });

export default connect(mapStateToProps, null)(App);

