const initialState = {
    cartItems: []
}
const companyReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'SET_DATA': {
            const newState = {...state};
            newState.cartItems = action.data;
            return newState;
        }
        case 'ADD_ITEM': {
            const newState = {...state};
            // const data = action.data ||
            const id = newState.cartItems.length ? ([newState.cartItems.length-1].id + 1) : 1;
            newState.cartItems.push({ name: 'XYZ', price: '$9.99', id: id });
            return newState;
        }
        case 'REMOVE_ITEM': {
            const newCartItems = state.cartItems.filter((item) => item.id !== action.data.id);
            return { cartItems: newCartItems };
        }
        default: return state;
    }
}

export default companyReducer;