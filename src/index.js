import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import Modal from 'react-modal';

import thunkMiddleware from 'redux-thunk';
import jsonRpcMiddleware from './middleware/jsonRpcMiddleware';

import App from './components/App';
import rootReducer from './reducers';
import JsonRpc from './utils/JsonRpc';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(jsonRpcMiddleware, thunkMiddleware)
  )
);

JsonRpc.setStore(store);

const appElement = document.getElementById('app');
Modal.setAppElement(appElement);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  appElement
);
