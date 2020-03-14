// import React from 'react';
// import ReactDOM from 'react-dom';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import companyReducer from './reducers/company-reducer';
import watchlistReducer from './reducers/watchlist-reducer';
import comparisionReducer from './reducers/comparision-reducer';
import commonReducer from './reducers/common-reducer';
// // import createSagaMiddlware from 'redux-saga';

const reducers = combineReducers({
    comapny: companyReducer,
    watchlist: watchlistReducer,
    comparision: comparisionReducer,
    common: commonReducer
});

const middlewares = applyMiddleware(thunk);
const store = createStore(reducers, middlewares);

export default store;