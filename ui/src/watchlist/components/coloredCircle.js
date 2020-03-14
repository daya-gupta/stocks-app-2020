import React from 'react';
import { updateMetadata } from '../../common/actions/commonActions';
import {connect} from 'react-redux'

const colorCodes = ['a', 'b', 'c', 'd'];
// portpholop, observable-positive, observable-negative and defect respectively 

class ColoredCircle extends React.PureComponent {
  state = {}
  toggleOptions = () => {
      const showOptions = !this.state.showOptions;
      this.setState({ showOptions, showNote: false });
  }

  toggleNote = () => {
        const showNote = !this.state.showNote;
        this.setState({ showNote, showOptions: false })
    }

    updateMetadata = (itemId, type, value) => {
    if (type === 'color') {
        this.setState({showOptions: false});
    } else if (type === 'note') {
        value = this.textarea.value;
        this.setState({showNote: false});
    }
    // tbd confirm change
    this.props.dispatch(this.props.updateMetadata(itemId, type, value));
  }

  moveStock = (index) => {
    this.toggleOptions();
    this.props.moveStock(index);
  }
  
  render = () => {
    const {showOptions, showNote} = this.state;
    const watchlistData = this.props.common.watchlistData;
    const {item, common} = this.props;
    const metadata = common.metadata || {};
    const note = (metadata[item.id] || {}).note;
    const color = (metadata[item.id] || {}).color;
    const className = `coloredCircle ${color}`;
      return (
          <React.Fragment>
              <button style={{margin: '3px'}} className={className} onClick={this.toggleOptions}></button>
              <button className="custom-button" onClick={this.toggleNote}>i</button>
              {showNote && <div style={{width: 'auto'}} className="moreActions">
                    <button style={{ margin: '-6px, -6px, 0 0' }} className="custom-button pull-right" onClick={this.toggleNote}>&times;</button>
                    <h6 class="pull-left">{item.name}</h6>
                    <div>
                        <textarea
                            ref={item => this.textarea = item}
                            defaultValue={note} 
                        >
                        </textarea>   
                    </div>
                    <button style={{background: 'white'}} className="pull-right" onClick={() => this.updateMetadata(item.id, 'note')}>Save</button>
                </div>}
              {showOptions && <div className="moreActions">
                  {
                      colorCodes.map(color => {
                          const className = `coloredCircle ${color}`;
                          return <span className={className} onClick={() => this.updateMetadata(item.id, 'color', color)}></span>;
                      })
                  }
                  <hr />
                  <b>Move to:</b>
                  {watchlistData.map((item, index) => {
                      return (
                          <li className="moveOptions" onClick={() => this.moveStock(index)}>{item.name}</li>
                      );
                  })}
              </div>}
          </React.Fragment>
      );
  }
}
const mapStateToProps = (state) => ({
    common: state.common
});

const mapDispatchToProps = (dispatch) => ({
    updateMetadata,
    dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(ColoredCircle);
