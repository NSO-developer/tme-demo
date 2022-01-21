import './index.css';
import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import Modal from 'react-modal';

import thunkMiddleware from 'redux-thunk';
import cometMiddleware from './middleware/cometMiddleware';
import jsonRpcMiddleware from './middleware/jsonRpcMiddleware';

import App from './components/App';
import rootReducer from './reducers';
import JsonRpc from './utils/JsonRpc';
import Comet from './utils/Comet';

import hljs from 'highlight.js';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import cli from './languages/cli';
import cb from './languages/curly-braces';

hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('cli', cli);
hljs.registerLanguage('curly-braces', cb);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(cometMiddleware, jsonRpcMiddleware, thunkMiddleware)
  )
);
const persistor = persistStore(store);

JsonRpc.setStore(store);
Comet.start();

const appElement = document.getElementById('app');
Modal.setAppElement(appElement);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  appElement
);

if (module.hot) {
  module.hot.accept('./reducers', () =>
      store.replaceReducer(require('./reducers').default)
  );
}
