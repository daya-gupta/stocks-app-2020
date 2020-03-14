import '../styles/common.scss';
import React from 'react';
import {connect} from 'react-redux'
import {selectWatchlist, addNewWatchlist} from '../actions/commonActions';

class WatchlistToggler extends React.PureComponent {
  state = { addFlow: false }
  selectWatchlist = (index) => {
    this.props.selectWatchlist(index);
    this.toggleWatchlistContainer();
  }
  addNewWatchlist = () => {
    this.setState({ addFlow: true });
    this.toggleWatchlistContainer();
  }
  confirmNewWatchlist = (isConfirmed) => {
    if (isConfirmed) {
      // read given name and add to store
      const watchlistName = this.nameInput.value;
      if (watchlistName) {
        this.props.addNewWatchlist(watchlistName);
      }
    }
    this.setState({ addFlow: false });
  }
  toggleWatchlistContainer = () => {
    this.setState({ toggleWatchlistContainer: !this.state.toggleWatchlistContainer });
  }
  render () {
      const { watchlistData, activeWatchlistIndex } = this.props.common;
      const activeWatchlistName = watchlistData[activeWatchlistIndex].name;
      return (
        <div className="pull-right toggleWatchlistContainer">
          <button className="custom-button" onClick={this.toggleWatchlistContainer}>Watchlist: <b>{activeWatchlistName}</b></button>
          {this.state.toggleWatchlistContainer && 
            <div className="listContainer">
              {watchlistData.map((item, index) => {
                  const customStyle = index === activeWatchlistIndex ? {fontWeight: 800 } : {} ; 
                  return(<li onClick={() => this.selectWatchlist(index)} style={customStyle}>{item.name}</li>);
              })}
              <li><button style={{background: '#aaa', color: 'white'}} className="custom-button" onClick={this.addNewWatchlist}>Add new list</button></li>
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
  addNewWatchlist
};

export default connect(mapStateToProps, mapDispatchToProps)(WatchlistToggler);

