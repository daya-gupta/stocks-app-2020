import React from 'react';
import styled from 'styled-components';
import Form from 'react-bootstrap/Form';
import ColoredCircle from './coloredCircle';

const RemoveStockBtn = styled.button`
    font-size: 10px,
    color: #fa3,
    cursor: pointer
`;

export default class WatchlistRow extends React.PureComponent {
    computeColorStyle = (price, range) => {
        const min = range[0];
        const max = range[1];
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 1;
        if (min > 0) {
            // min and max both are positive
            // green color
            const diff = max;
            const units = max - price; 
            g = 256;
            a = units/diff;
        } else if (max < 0) {
            // min and max both are negative
            // red color
            const diff = min;
            const units = min - price;
            r = 256;
            a = units/diff;
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
        return style;
    }
  render = () => {
      const { item, company, index, handleCheckboxChange, renderChart, removeStock, moveStock,
        priceChangeRange, weeksArr, chartWidth, updateCompany } = this.props;
      const scoreR = item.growthScore.revenueScore;
      const scoreP = item.growthScore.profitScore;
      const {name, url} = company;
      const checked = item.checked;
  
      return (
          <tr key={index}>
              <td>
                  <Form.Check type='checkbox' checked={checked} onChange={handleCheckboxChange} />
              </td>
              <td>
                  <ColoredCircle updateCompany={updateCompany} company={company} moveStock={moveStock} />
              </td>
              <td>{scoreR}, {scoreP}</td>
              <td>
                  <a rel="noopener noreferrer" target="_blank" href={`https://www.screener.in${url}`}>
                      {name}
                  </a>
              </td>
                {/* {this.renderReferenceScore()} */}
                {weeksArr.map((i, index) => {
                    const price = item.priceChange[i];
                    const range = priceChangeRange[index];
                    const style = this.computeColorStyle(price, range);
                    return (
                        <td key={index} style={style}>
                            {!index && <span>{item.price} &nbsp;</span>}
                            {price} %
                        </td>
                    );
                })}
              {!chartWidth && <td><RemoveStockBtn className="fa fa-times" onClick={() => removeStock(index)}></RemoveStockBtn></td>}
              {/* <td>{renderChart(item.historicalData, index)}</td> */}
          </tr>
      );
  }
}
