import React from 'react';
import { updateColor, updateComment } from '../../common/actions/commonActions';
import {connect} from 'react-redux'

const colorCodes = ['grey', 'blue', 'orange', 'red', 'teal'];
// portpholop, observable-positive, observable-negative and defect respectively 

class ColoredCircle extends React.PureComponent {
    state = {}
    toggleOptions = () => {
        const showOptions = !this.state.showOptions;
        this.setState({ showOptions, showComment: false });
    }

    toggleComment = () => {
        const showComment = !this.state.showComment;
        this.setState({ showComment, showOptions: false })
    }

    updateColor = (_id, color) => {
        this.props.updateColor(_id, color, () => {
            this.setState({ showOptions: false });
            this.props.updateCompany('color', color);
        });
    }

    updateComment = (company) => {
        const comment = this.textarea.value || '';
        this.props.updateComment(company._id, comment, () => {
            this.setState({ showComment: false });
            this.props.updateCompany('comment', comment);
        });
    }

    moveStock = (targetWatchlist) => {
        console.time();
        this.props.moveStock(targetWatchlist);
        this.toggleOptions();
    }
  
    render = () => {
        const { showOptions, showComment } = this.state;
        const { company, common } = this.props;
        const watchlistData = common.watchlistData;
        const {comment, color, name} = company;
        const className = `coloredCircle ${color}`;
        return (
            <React.Fragment>
                <button style={{ margin: '3px' }} className={className} onClick={this.toggleOptions}></button>
                <button className="custom-button" onClick={this.toggleComment}>i</button>
                {showComment && <div style={{ width: 'auto' }} className="moreActions">
                    <button style={{ margin: '-6px, -6px, 0 0' }} className="custom-button pull-right" onClick={this.toggleComment}>&times;</button>
                    <h6 className="pull-left">{name}</h6>
                    <div>
                        <textarea
                            ref={item => this.textarea = item}
                            defaultValue={comment}
                        >
                        </textarea>
                    </div>
                    <button style={{ background: 'white' }} className="pull-right" onClick={() => this.updateComment(company)}>Save</button>
                </div>}
                {showOptions && <div className="moreActions">
                    <b>Label:</b>
                    <br />
                    {
                        colorCodes.map(color => {
                            const className = `coloredCircle ${color}`;
                            return <span key={color} className={className} onClick={() => this.updateColor(company._id, color)}></span>;
                        })
                    }
                    <hr />
                    <b>Move to:</b>
                    {watchlistData.map((item, index) => {
                        const disabled = item.name === 'Master' || item._id === company.watchlistId;
                        return (
                            <li key={index} className="moveOptions" onClick={() => this.moveStock(item._id)}>
                                <button disabled={disabled} className="custom-button">{item.name}</button>
                            </li>
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
