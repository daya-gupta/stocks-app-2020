import React from 'react';
import { updateColor, updateComment } from '../../common/actions/commonActions';
import {connect} from 'react-redux'

const colorCodes = ['grey', 'blue', 'orange', 'red', 'teal'];
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

    updateColor = (_id, color) => {
        this.setState({ showOptions: false });
        this.props.updateColor(_id, color);
    }

    updateComment = (company) => {
        const comment = this.textarea.value || '';
        this.props.updateComment(company._id, comment);
        this.setState({ showNote: false });
    }

    moveStock = (index) => {
        this.toggleOptions();
        this.props.moveStock(index);
    }
  
    render = () => {
        const { showOptions, showNote } = this.state;
        const { item, common } = this.props;
        const watchlistData = common.watchlistData;
        const note = item.comment;
        const color = item.color;
        const className = `coloredCircle ${color}`;
        return (
            <React.Fragment>
                <button style={{ margin: '3px' }} className={className} onClick={this.toggleOptions}></button>
                <button className="custom-button" onClick={this.toggleNote}>i</button>
                {showNote && <div style={{ width: 'auto' }} className="moreActions">
                    <button style={{ margin: '-6px, -6px, 0 0' }} className="custom-button pull-right" onClick={this.toggleNote}>&times;</button>
                    <h6 className="pull-left">{item.name}</h6>
                    <div>
                        <textarea
                            ref={item => this.textarea = item}
                            defaultValue={note}
                        >
                        </textarea>
                    </div>
                    <button style={{ background: 'white' }} className="pull-right" onClick={() => this.updateComment(item)}>Save</button>
                </div>}
                {showOptions && <div className="moreActions">
                    {
                        colorCodes.map(color => {
                            const className = `coloredCircle ${color}`;
                            return <span key={color} className={className} onClick={() => this.updateColor(item._id, color)}></span>;
                        })
                    }
                    <hr />
                    <b>Move to:</b>
                    {watchlistData.map((item, index) => {
                        return (
                            <li key={index} className="moveOptions" onClick={() => this.moveStock(index)}>{item.name}</li>
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

const mapDispatchToProps = {
    updateColor,
    updateComment,
    // dispatch
};

export default connect(mapStateToProps, mapDispatchToProps)(ColoredCircle);
