const comparisionReducer = (state = {}, action) => {
    switch(action.type) {
        // case 'UPDATE_TOTAL': {
        //     const newState = Object.assign({ test: 'test-item' }, state);
        //     newState.cartTotal = Number(newState.cartTotal) + 100;
        //     return newState;
        // }
        default: return state;
    }
}

export default comparisionReducer;
