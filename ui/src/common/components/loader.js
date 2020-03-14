import React from 'react';
// import loaderImg from '../images/loader.gif';
import loaderImg from '../images/logo.svg';

export default function() {
    return (
        <div className="loader-container">
            <div className="loader-inner-container">
                <img className="img-spinner" src={loaderImg} alt="loader" />
            </div>
        </div>
    );
}
