const watchlistReducer = (state = { cartTotal: '500', checkboxSelectionList: [] }, action) => {
    switch (action.type) {
        case 'CHECKBOX_SELECTION_LIST': return {
            ...state,
            checkboxSelectionList: action.data
        }

        default: return state;
    }
}


export default watchlistReducer;