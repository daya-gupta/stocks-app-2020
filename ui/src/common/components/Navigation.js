import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {getAllUsers} from '../actions/commonActions'

class Navigation extends React.PureComponent {
    componentDidMount() {
        this.props.getAllUsers();
    }
    render() {
        return (
            <div className="nav-container">
                <div className="navbar navbar-expand-sm navbar-light">
                    <span className="navbar-brand">Stock Analysis</span>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                {/* <button className="btn nav-link">Company</button> */}
                                <Link className="nav-link" to='/'>Company</Link>
                            </li>
                            <li className="nav-item">
                                {/* <button className="btn nav-link">Watchlist</button> */}
                                <Link className="nav-link" to='/watchlist'>Watchlist</Link>
                            </li>
                            <li className="nav-item">
                                {/* <button className="btn nav-link">Comparision</button> */}
                                <Link className="nav-link" to='/comparision'>Comparision</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/User'>User</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* <div className="navbar navbar-expand-lg navbar-light bg-light">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Link</a>
                            </li>
                        </ul>
                    </div>
                </div> */}
            </div>
        );
    };
}

const mapStateToProps = (state) => ({
    common: state.common
});

const mapDispatchToProps = {
    getAllUsers
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);