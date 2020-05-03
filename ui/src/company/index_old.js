// import React, { Component, Fragment } from 'react';
// import {connect} from 'react-redux';
// // import axios from 'axios';
// import '../common/styles/company.css';
// import Typeahead from '../common/components/typeahead';
// import styles from './styles.module.css';
// import { getHistoricalData, searchCompany } from './action';
// import ChartRender from '../components/chartRender';
// import { processHistoricalData } from '../common/util';
// // import { styles } from 'ansi-colors';

// class Company extends Component {
//     state={ selectedCompany: null, historicalData: [] };
    
//     // getMatchesFromNse(keyword, callback) {
//     //     // axios.get(`https://www.screener.in/api/company/search/?q=${keyword}`).then((res) => {
//     //     axios.get(`https://www.nseindia.com/live_market/dynaContent/live_watch/get_quote/ajaxCompanySearch.jsp?search=${keyword}`).then((res) => {
//     //         // console.log(res.data);
//     //         // const data = getProcessedData(res.data);
//     //         callback(res.data);
//     //     });
//     // }

//     // getKeywordMatches(e) {
//     //     const keyword = e.target.value
//     //     this.setState({ keyword });
//     //     if(keyword.length > 1) {
//     //         // this.getMatchesFromNse(keyword, (searchResult) => {
//     //         this.props.searchCompany(keyword, (searchResult) => {
//     //             // this.setState({ searchResult });
//     //             console.log(searchCompany);
//     //         });
//     //     } else {
//     //         this.setState({ searchResult: '' });
//     //     }
//     // }

//     // selectStock(e) {
//     //     // need refactoring..
//     //     e.preventDefault();
//     //     this.setState({ searchResult: '', keyword: '' });
//     //     const stockDetails = {};
//     //     let target = e.target;
//     //     if(target.nodeName !== 'A') {
//     //         target = target.parentElement;
//     //     }
//     //     if(target.nodeName !== 'A') {
//     //         target = target.parentElement;
//     //     }
//     //     if(target.nodeName !== 'A') {
//     //         target = target.parentElement;
//     //     }
//     //     const queryString = target.getAttribute('href').split('?')[1];
//     //     queryString.split('&').map(item => {
//     //         const splits = item.split('=');
//     //         stockDetails[splits[0]] = splits[1];
//     //     });
//     //     this.setState({ selectedStock: stockDetails.symbol });
//     //     this.props.getHistoricalData(stockDetails.symbol, (data) => {
//     //         this.setState({ historicalData: data });
//     //     });
//     // }

//     selectCompany = (selection) => {
//         this.setState({ selectedCompany: { name: selection.name, id: selection.id }});
//         this.props.getHistoricalData(selection.id, (data) => {
//             this.setState({ historicalData: data });
//         });
//     }

//     renderHistoricalData() {
//         const data = this.state.historicalData;
//         if(data.length === 0) {
//             return null;
//         }
//         const processedData = processHistoricalData(data.prices);
//         return (
//              /* Please  uncomment the below lines of code to render data as a table  */
//             // <table className="table table-stripped">
//             //     <tr>
//             //         <th>Date</th>
//             //         <th>Price</th>
//             //         <th>Volume</th>
//             //     </tr>
//             //     { processedData.map((item, index) => {
//             //         return(
//             //             <tr key={index}>
//             //                 <td>{item.date}</td>
//             //                 <td>{item.price}</td>
//             //                 <td>{item.volume}</td>
//             //             </tr>
//             //         );
//             //     })}
//             // </table>
//             <ChartRender processedData = {processedData} selectStock = {this.state.selectedCompany}/>
//         );
//     }

//     addToWatchlist = () => {
//         const selectedCompanyId = this.state.selectedCompany.id;
//         const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
//         if (watchlist.indexOf(selectedCompanyId) === -1) {
//             watchlist.push(selectedCompanyId);
//             localStorage.setItem('watchlist', JSON.stringify(watchlist));
//         } else {
//             // stock already exist
//             alert('stock already exist in the watchlist');
//         }
//     }

//     render() {
//         return (
//             <div id="company">
//                 {/* <div className="search-container">
//                     <div className="search-container-inner">
//                         <input type="text" onChange={(e) => this.getKeywordMatches(e)} value={this.state.keyword} />
//                         <div class="search-result" onClick={(e) => this.selectStock(e)} dangerouslySetInnerHTML={{ __html: this.state.searchResult}}></div>
//                     </div>
//                 </div> */}
//                 <Typeahead searchCompany={this.props.searchCompany} selectCompany={this.selectCompany} />
//                 <h1>{!this.state.selectedCompany ? 'No company selected' : `Selected company is: ${this.state.selectedCompany.name}`}</h1>
//                 {this.state.selectedCompany && <button className="btn btn-primary" onClick={this.addToWatchlist}>Add to watchlist</button>}
//                 {/* <button className={`btn btn-primary ${styles.testButton}`}>test button</button> */}
//                 {this.renderHistoricalData()}
//             </div>
//         )
//     }
// }

// const mapStateToProps = (state) => ({
//     company: state.company 
// })

// const mapDispatchToProps = {
//     getHistoricalData,
//     searchCompany
// };

// const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(Company);

// export default connectedComponent;