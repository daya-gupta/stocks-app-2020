import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import ColoredCircle from './coloredCircle';

const weeksArr = [0, 1, 2, 4, 9, 13, 26, 52, 72];

const RemoveStockBtn = styled.button`
    font-size: 10px,
    color: #fa3,
    cursor: pointer
`;

export default class WatchlistRow extends React.PureComponent {
  render = () => {
      const { item, index, handleCheckboxChange, renderChart, removeStock, moveStock, watchlist, watchlistData, priceChangeRange } = this.props;
      const scoreR = item.growthScore.revenueScore;
      const scoreP = item.growthScore.profitScore;
      const name = item.name;
      const url = item.url;
      const checked = item.checked;
    //   const price = item.price || 'NA';
    //   const volume = item.volume || 'NA';
      const change = item.change;

      return (
          <tr key={index}>
              <td>
                  <Form.Check type='checkbox' checked={checked} onChange={handleCheckboxChange} />
              </td>
              <td>
                  <ColoredCircle item={item} moveStock={moveStock} watchlistData={watchlistData} />
              </td>
              <td>{scoreR}, {scoreP}</td>
              <td>
                  <a rel="noopener noreferrer" target="_blank" href={`https://www.screener.in${url}`}>
                      {name}
                  </a>
              </td>
              {/* <td>{price}, ({item.priceChange[0]})%</td> */}
              {/* <td>{weeksArr.map(i => item.priceChange[i]).slice(1).join('%, ')}%</td> */}
              {/* {weeksArr.map((i, index) => {
                  if (!index) {
                      return null;
                  } else {
                      return (<td>{item.priceChange[i]} %</td>);
                  }
                })} */}
                {weeksArr.map((i, index) => {
                    if (1-1) {
                        return null;
                    } else {
                    const price = item.priceChange[i];
                    const range = priceChangeRange[index];
                    const min = range[0];
                    const max = range[1];
                    let r = 0;
                    let g = 0;
                    let b = 0;
                    let a = 1;
                    if (min > 0) {
                        // min and max both are positive
                    } else if (max < 0) {
                        // min and max both are negative
                    } else {
                        // min is negative and max is positive
                        if (price > 0) {
                            // green color
                            const diff = max;
                            const units = max - price; 
                            g = 256;
                            a = units/diff;
                        } else {
                            // red color
                            const diff = min;
                            const units = min - price;
                            r = 256;
                            a = units/diff;
                        }
                    }
                    const style = {backgroundColor: `rgba(${r}, ${g}, ${b}, ${(1-a)})`};
                    return (
                        <td style={style}>
                            {!index && <span>{item.price} &nbsp;</span>}
                            {price} %
                        </td>
                    );
                  }
                })}
              {/* <td>{price}, {item.priceChange[0]}%</td> */}
              {/* <td>{volume}, ({change.volume})%</td> */}
              <td><RemoveStockBtn className="fa fa-times" onClick={() => removeStock(index)}></RemoveStockBtn></td>
              <td>{renderChart(item.historicalData, index)}</td>
          </tr>
      );
  }
}
