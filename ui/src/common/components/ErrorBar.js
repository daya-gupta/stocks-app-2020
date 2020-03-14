import React from 'react';
import { connect } from 'react-redux';
import { resetError } from '../actions/commonActions';

// expects error object in following format
// {
//     message: 'String - error message that appears on screen',
//     isHtml: 'Boolean - flag to represent whether message is text string or html string',
//     messageType: 'String - error/warning/success'
// }
let timer = null;
const resetTimer = (callback) => {
    timer && clearTimeout(timer);
    timer = setTimeout(callback, 5000);
}

const ErrorBar = (props) => {
    if (!props.error.message) {
        return null;
    }
    const error = props.error;
    const customClass = `error-bar ${error.messageType || 'error'}`;
    resetTimer(props.resetError);
    return (
        <div className={customClass}>
            <button className="custom-button pull-right close" onClick={() => props.resetError()}>&times;</button>
            {error.isHtml ? <span dangerouslySetInnerHTML={{ __html: error.message }}></span> : <span>{error.message}</span>}
        </div>
    );
}

const mapStateToProps = (state) => ({
       error: state.common.error || {}
})

const mapDispatchToProps = {
    resetError
}

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(ErrorBar);

export default connectedComponent;

