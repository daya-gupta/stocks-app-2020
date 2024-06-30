import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import {baseUrl} from '../common/constants';
import TypeaheadComponent from '../common/components/typeahead';

const userId = '5f9d5fc8b31dac38c13c129d';

// const data = [
//     { stock: { id: '1234', name: 'Sun Pharma' }, buyDate: new Date(), quantity: 20, price: 110.5, currentPrice: 120.95 },
//     { stock: { id: '2234', name: 'Avantel' }, buyDate: new Date(), quantity: 50, price: 59.0, currentPrice: 167.5 },
//     { stock: { id: '3234', name: 'Tata coffee' }, buyDate: new Date(), quantity: 200, price: 20.5, currentPrice: 20.9 },
//     { stock: { id: '4234', name: 'M&M' }, buyDate: new Date(), quantity: 24, price: 100.5, currentPrice: 90.95 },
// ];

const openPositionHeaders = ['SN', 'Action', 'Stock', 'Buy Date', 'Sell Date', 'Quantity', 'B Price', 'C Price', 'Profit', 'Percentage(%)']
const closePositionHeaders = ['SN', 'Action', 'Stock', 'Buy Date', 'Sell Date', 'Quantity', 'B Price', 'S Price', 'Profit', 'Percentage(%)']

const getProfit = ({quantity, buyPrice, currentPrice, sellPrice}) => {
    const unitProfit = (sellPrice || currentPrice) - buyPrice;
    return Number((unitProfit * quantity).toFixed(1));
}

const getTotalProfit = (data) => {
    return data.reduce((acc, item) => {
        return acc + getProfit(item)
    }, 0);
}

const getPercentageProfit = ({quantity, buyPrice, currentPrice, sellPrice}) => {
    const unitProfit = (sellPrice || currentPrice) - buyPrice;
    const totalProfit = unitProfit * quantity;
    const totalCost = quantity * buyPrice;
    const percentageProfit = totalProfit * 100 / totalCost;
    return Number(percentageProfit.toFixed(1));
}

const getAveragePercentageProfit = (data) => {
    if (!data?.length) return 0;
    const totalPercentageProfit = data.reduce((acc, item) => {
        return acc + getPercentageProfit(item);
    }, 0);
    return Number((totalPercentageProfit/data.length).toFixed(1));
}



const Portfolio = () => {
    const [showRemoveStockForm, setShowRemoveStockForm] = useState(false);
    const [showAddStockForm, setShowAddStockForm] = useState(false);
    const [addStockForm, setAddStockForm] = useState({
        stock: {},
        // buyDate: '',
        // quantity: '',
        // buyPrice: ''
    });
    const [removeStockForm, setRemoveStockForm] = useState({
        stock: {},
        // buyDate: '',
        // sellDate: '',
        // quantity: '',
        // buyPrice: '',
        // sellPrice: ''
    });
    const [portfolioData, setPortfolioData] = useState([]);
    const [closedPositions, setClosedPositions] = useState([]);

    const handleRemoveStock = (item, index) => {
        setShowRemoveStockForm(true);
        // populate item in remove form
        setRemoveStockForm({...item, sellPrice: item.currentPrice, sellDate: new Date(), rowIndex: index});
    }

    const renderPortfolioTable = (data, isOpen) => {
        const headers = isOpen ? openPositionHeaders : closePositionHeaders;
        return (
            <table cellPadding={10} className='table table-stripped'>
                <tr>
                    {headers.map(item => (<th key={item}>{item}</th>))}
                </tr>
                {data.map((item, index) => {
                    return (
                        <tr>
                            <td>{index + 1}</td>
                            <td>
                                <button onClick={() => handleRemoveStock(item, index)}>X</button>
                            </td>
                            <td>{item.stock?.name}</td>
                            <td>{String(item.buyDate || '-')}</td>
                            <td>{String(item.sellDate || '-')}</td>
                            <td>{item.quantity}</td>
                            <td>{item.buyPrice}</td>
                            <td>{item.sellPrice || item.currentPrice}</td>
                            <td>{getProfit(item)}</td>
                            <td>{getPercentageProfit(item)}</td>
                        </tr>
                    );
                })}
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>{getTotalProfit(data)}</strong></td>
                    <td><strong>{getAveragePercentageProfit(data)}</strong></td>
                </tr>
            </table>
        );
    }

    const handleAddStockFormChange = (type, event) => {
        // handle validation
        const newFormState = {...addStockForm, [type]: event.target.value};
        setAddStockForm(newFormState);
        
    }

    const handleAddStock = () => {
        setShowAddStockForm(true);
        const newFormState = {...addStockForm, buyDate: new Date()};
        setAddStockForm(newFormState);
    }

    const handleAddStockConfirm = () => {
        const rowData = {...addStockForm, userId, isOpen: true};
        const newPortfolioData = [...portfolioData, rowData];
        rowData.stock = JSON.stringify(rowData.stock);
        Axios.post(`${baseUrl}/api/portfolio/company`, rowData).then((res, error) => {
            // add current price to list
            console.log('add to portfolio response', res);
            setPortfolioData(newPortfolioData);
            setAddStockForm({
                stock: {},
                // buyDate: '',
                // quantity: '',
                // buyPrice: ''
            });
            setShowAddStockForm(false);
        });
    }

    const getPromises = (ids) => {
        const duration = 5;
        return new Promise((res, rej) => {
            const promiseArr = [];
            ids.forEach((item, index) => {
                setTimeout(() => {
                   promiseArr.push(Axios.get(`${baseUrl}/historicalData?companyId=${item}&duration=${duration}`));
                }, 1000 * index);
            });
            setTimeout(()=>{
                res(promiseArr);
            }, 1000 * ids.length)
            // const promiseArr = ids.map(item => Axios.get(`${baseUrl}/historicalData?companyId=${item}&duration=${duration}`))
        });
    }

    const getPortfolio = async(positionType, callback) => {
        // const type = isOpen ? 'open' : 'closed';
        // { stock: 'Sun Pharma', buyDate: new Date(), quantity: 20, buyPrice: 110.5, currentPrice: 120.95 },
        Axios.get(`/api/portfolio/${userId}/${positionType}`).then(async(res, error) => {
            console.log('get portfolio response', res);
            let newPortfolioData = res.data.map(item => ({...item, stock: JSON.parse(item.stock)}));
            
            // make calls to get current price
            const ids = newPortfolioData.map(item => item.stock.id);
            // const duration = 1;
            const promiseArr = await getPromises(ids);
            // const promiseArr = ids.map(item => Axios.get(`${baseUrl}/historicalData?companyId=${item}&duration=${duration}`))
            
            const resArr = await Promise.all(promiseArr);
            newPortfolioData = newPortfolioData.map((item, index) => (
                {...item, currentPrice: resArr[index]?.data?.datasets[0]?.values[resArr[index]?.data?.datasets[0]?.values.length - 1][1] ?? 0}
            ))
            // axios.get(`${baseUrl}/historicalData?companyId=${companyId}&duration=${duration}`).then((res) => {
            //     dispatch({ type: 'HIDE_LOADER' });
            //     callback(res.data);
            // })
            callback(newPortfolioData);
            // setAddStockForm({
            //     stock: {},
            //     buyDate: '',
            //     quantity: '',
            //     buyPrice: ''
            // });
        })
    } 

    const searchCompany = (data, callback) => {
        Axios.get(`${baseUrl}/searchCompany?data=${data}`).then((res) => {
            callback(res.data);
        })
    }

    const selectCompany = (selection) => {

        const newFormState = {...addStockForm, stock: {...selection}};
        setAddStockForm(newFormState);

        // selection.companyId = selection.id;
        // delete selection.id;

        // this.setState({ selectedCompany: selection });
        // const duration = this.state.duration;
        // const companyId = selection.companyId;
        // const url = selection.url;
        // this.props.getHistoricalData({companyId, duration}, this.historicalDataCallback);
        // this.props.getConsolidatedData({url}, this.consolidatedDataCallback);
    }

    const renderAddStockForm = () => {
        return(
            <div>
                <div className="row ml-4 mr-4 mt-5 mb-5">
                    {/* <div className="col-md-12 col-lg-8 company-actions">
                        {this.renderDuration()}
                        {this.state.selectedCompany && <button className="btn btn-primary pull-left mb-2" onClick={this.addToWatchlist}>Add to watchlist</button>}
                    </div> */}
                    <div className="col-3">
                        <div>Stock: </div>
                        <TypeaheadComponent searchCompany={searchCompany} selectCompany={selectCompany} />
                    </div>
                    <div className="col-2">
                        <div>Buy Date: </div>
                        <input type="date" value={addStockForm.buyDate} onChange={(e) => handleAddStockFormChange('buyDate', e)} />
                    </div>
                    <div className="col-1">
                        <div>Quantity: </div>
                        <input type="text" value={addStockForm.quantity} onChange={(e) => handleAddStockFormChange('quantity', e)} />
                    </div>
                    <div className="col-3">
                        <div>Buy Price:</div>
                        <input type="text" value={addStockForm.buyPrice} onChange={(e) => handleAddStockFormChange('buyPrice', e)} />
                    </div>
                    <div className="col-3">
                        <button className='pull-right' onClick={handleAddStockConfirm}>Add Position</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleRemoveStockConfirm = async() => {
        // make api call to close position
        console.log(removeStockForm);
        const formData = {...removeStockForm, isOpen: false, userId, stock: JSON.stringify(removeStockForm.stock)};
        delete formData.currentPrice;
        await Axios.put(`${baseUrl}/api/portfolio/company`, formData);
        // remove item from index
        const newPortfolioData = [...portfolioData];
        newPortfolioData.splice(removeStockForm.rowIndex, 1);
        // update state
        setPortfolioData(newPortfolioData)
        setShowRemoveStockForm(true);
        setRemoveStockForm({ stock: {} });
    }

    const handleRemoveStockFormChange = (field, event) => {
        setRemoveStockForm({...removeStockForm, [field]: event.target.value});
    }

    const renderRemoveStockForm = () => {
        return(
            <div>
                <div className="row ml-4 mr-4 mt-5 mb-5">
                    {/* <div className="col-3">
                        <div>Stock: </div>
                        <TypeaheadComponent searchCompany={searchCompany} selectCompany={selectCompany} />
                    </div> */}
                    <input disabled type="text" value={removeStockForm.stock.name} />
                    <div className="col-2">
                        <div>Buy Date: </div>
                        <input disabled type="date" value={removeStockForm.buyDate} onChange={(e) => handleRemoveStockFormChange('buyDate', e)} />
                    </div>
                    <div className="col-2">
                        <div>Sell Date: </div>
                        <input type="date" value={removeStockForm.sellDate} onChange={(e) => handleRemoveStockFormChange('sellDate', e)} />
                    </div>
                    <div className="col-1">
                        <div>Quantity: </div>
                        <input disabled type="text" value={removeStockForm.quantity} onChange={(e) => handleRemoveStockFormChange('quantity', e)} />
                    </div>
                    <div className="col-2">
                        <div>Buy Price:</div>
                        <input disabled type="text" value={removeStockForm.buyPrice} onChange={(e) => handleRemoveStockFormChange('buyPrice', e)} />
                    </div>
                    <div className="col-2">
                        <div>Sell Price:</div>
                        <input type="text" value={removeStockForm.sellPrice} onChange={(e) => handleRemoveStockFormChange('sellPrice', e)} />
                    </div>
                    <div className="col-3">
                        <button className='pull-right' onClick={handleRemoveStockConfirm}>Close position</button>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        getPortfolio('open', setPortfolioData);
        setTimeout(() => {
            getPortfolio('closed', setClosedPositions);
        }, 2000)
    }, []);

    return (
        <>
            <h2>Investment summary</h2>
            {/* <button className='pull-right'>Add stock</button> */}
            {showRemoveStockForm && renderRemoveStockForm()}
            {showRemoveStockForm && <hr />}
            <div>
                {/* <button disabled={showAddStockForm} className='pull-right' onClick={handleAddStock}>Add stock</button> */}
                <button className='pull-right' onClick={handleAddStock}>{showAddStockForm ? 'Close (X)' : 'Show Add Stock Form'}</button>
            </div>
        
            {showAddStockForm && renderAddStockForm()}
            {showAddStockForm && <hr />}
            <hr />
            {renderPortfolioTable(portfolioData, true)}
            <hr />
            <h2>Closed positions</h2>
            {renderPortfolioTable(closedPositions, false)}
        </>
    );
}

export default Portfolio;