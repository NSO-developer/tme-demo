import './index.css';
import 'tippy.js/dist/tippy.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import Modal from 'react-modal';

import { registerLanguages } from 'features/config/highlight';
import { store } from 'app/store';
import App from 'app/App';

registerLanguages();
const persistor = persistStore(store);

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
  module.hot.accept('./api', () =>
      store.replaceReducer(require('./api').default)
  );
}
