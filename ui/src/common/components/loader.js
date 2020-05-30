import React from 'react';
import loaderImg from '../images/logo.svg';

export default function({...props}) {
    return (
        <div className="loader-container" style={{ visibility: props.show ? 'visible' : 'hidden' }}>
            <div className="loader-inner-container">
                <img className="img-spinner" src={loaderImg} alt="loader" />
            </div>
        </div>
    );
}
