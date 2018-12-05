import './index.css';
import 'tippy.js/dist/tippy.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import Modal from 'react-modal';

import thunkMiddleware from 'redux-thunk';
import cometMiddleware from './middleware/cometMiddleware';
import jsonRpcMiddleware from './middleware/jsonRpcMiddleware';

import App from './components/App';
import rootReducer from './reducers';
import JsonRpc from './utils/JsonRpc';
import Comet from './utils/Comet';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(cometMiddleware, jsonRpcMiddleware, thunkMiddleware)
  )
);

JsonRpc.setStore(store);
Comet.start();

const appElement = document.getElementById('app');
Modal.setAppElement(appElement);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  appElement
);
