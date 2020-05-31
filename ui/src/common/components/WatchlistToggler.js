import '../styles/common.scss';
import React from 'react';
import {connect} from 'react-redux'
import {selectWatchlist, addWatchlist, deleteWatchlist} from '../actions/commonActions';

class WatchlistToggler extends React.PureComponent {
  state = { addFlow: false }
  
  selectWatchlist = (watchlist) => {
    const activeWatchlist = this.props.common.activeWatchlist;
    if (activeWatchlist._id === watchlist._id) {
      return;
    }
    this.props.selectWatchlist(watchlist);
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
        this.props.addWatchlist(watchlistName);
      }
    }
    this.setState({ addFlow: false });
  }

  toggleWatchlistContainer = () => {
    this.setState({ toggleWatchlistContainer: !this.state.toggleWatchlistContainer });
  }

  deleteWatchlist = (e, watchlist) => {
    e.stopPropagation();
    const confirm = window.confirm(`Please confirm that you want to delete ${watchlist.name} watchlist. All stocks in the watchlist will also get deleted.`);
    if (confirm) {
      this.props.deleteWatchlist(watchlist._id);
    }
  }

  render () {
      const { watchlistData, activeWatchlist } = this.props.common;
      if (!watchlistData || !watchlistData.length) {
        return null;
      }
      const activeWatchlistName = activeWatchlist.name;
      return (
        <div className="pull-right toggleWatchlistContainer">
          <button className="custom-button" onClick={this.toggleWatchlistContainer}>Watchlist: <b>{activeWatchlistName}</b></button>
          {this.state.toggleWatchlistContainer && 
            <div className="listContainer">
              <ul style={{paddingLeft: '20px'}}>
                {watchlistData.map((item, index) => {
                    const customStyle = item._id === activeWatchlist._id ? {fontWeight: 800 } : {} ; 
                    return(
                      <li key={index} onClick={() => this.selectWatchlist(item)} style={customStyle}>
                        <span>{item.name}</span>
                        <button disabled={item.default || item.name==='Master'} className="pull-right" onClick={(e) => this.deleteWatchlist(e, item)}>&times;</button>
                      </li>
                    );
                })}
              </ul>
              <button style={{width: '100%', fontSize: '14px'}} className="btn btn-primary" onClick={this.addWatchlist}>Add new list</button>
            </div>
          }
          {this.state.addFlow &&
            <div className="addWatchlistContainer">
              <div>
                <input type="text" ref={(item) => {this.nameInput = item;}} placeholder="Watchlist name..." />
                <button className="custom-button" onClick={() => this.confirmNewWatchlist(true)}>Save</button>&nbsp;&nbsp;
                <button className="custom-button" onClick={this.confirmNewWatchlist}>Cance;</button>
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

