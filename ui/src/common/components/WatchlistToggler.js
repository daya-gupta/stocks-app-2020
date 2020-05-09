import '../styles/common.scss';
import React from 'react';
import {connect} from 'react-redux'
import {selectWatchlist, addWatchlist, deleteWatchlist} from '../actions/commonActions';

const watchlistColors = ['white', 'green', 'orange', 'red', 'teal', 'black'];

class WatchlistToggler extends React.PureComponent {
  state = { addFlow: false }
  selectWatchlist = (index) => {
    this.props.selectWatchlist(index);
    this.toggleWatchlistContainer();
  }
  addWatchlist = () => {
    this.setState({ addFlow: true });
    this.toggleWatchlistContainer();
  }
  confirmNewWatchlist = (isConfirmed) => {
    if (isConfirmed) {
      // read given name and add to store
      const watchlistName = this.nameInput.value;
      if (watchlistName) {
        const color = watchlistColors[this.props.common.watchlistData.length];
        this.props.addWatchlist(watchlistName, color);
      }
    }
    this.setState({ addFlow: false });
  }
  toggleWatchlistContainer = () => {
    this.setState({ toggleWatchlistContainer: !this.state.toggleWatchlistContainer });
  }
  deleteWatchlist = (watchlist) => {
    const confirm = confirm(`Please confirm that you want to delete ${watchlist.name} watchlist`);
    if (confirm) {
      this.props.deleteWatchlist(watchlist._id);
    }
  }
  render () {
      const { watchlistData, activeWatchlistIndex, activeWatchlist } = this.props.common;
      if (!watchlistData) {
        return null;
      }
      const activeWatchlistName = activeWatchlist.name;
      return (
        <div className="pull-right toggleWatchlistContainer">
          <button className="custom-button" onClick={this.toggleWatchlistContainer}>Watchlist: <b>{activeWatchlistName}</b></button>
          {this.state.toggleWatchlistContainer && 
            <div className="listContainer">
              {watchlistData.map((item, index) => {
                  const customStyle = item._id === activeWatchlist._id ? {fontWeight: 800 } : {} ; 
                  return(
                    <li key={index} onClick={() => this.selectWatchlist(index)} style={customStyle}>
                      <span style={{ backgroundColor: item.color }}>t</span>
                      <span>{item.name}</span>
                      <button disabled={item.default} className="pull-right" onClick={() => this.deleteWatchlist(item)}>&times;</button>
                    </li>
                  );
              })}
              <li><button style={{background: '#aaa', color: 'white'}} className="custom-button" onClick={this.addWatchlist}>Add new list</button></li>
            </div>
          }
          {this.state.addFlow &&
            <div className="addWatchlistContainer">
              <div>
                <input type="text" ref={(item) => {this.nameInput = item;}} placeholder="Watchlist name..." />
                <button className="custom-button" onClick={() => this.confirmNewWatchlist(true)}>Save</button>&nbsp;&nbsp;
                <button className="custom-button" onClick={this.confirmNewWatchlist}>Cance</button>
              </div>
            </div>
          }
        </div>
      );
  }
}

const mapStateToProps = (state) => ({
  common: state.common
})

const mapDispatchToProps = {
  selectWatchlist,
  addWatchlist,
  deleteWatchlist,
};

export default connect(mapStateToProps, mapDispatchToProps)(WatchlistToggler);

