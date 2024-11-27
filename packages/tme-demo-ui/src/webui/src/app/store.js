import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
         persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { jsonRpcApi } from 'api';
import topologyReducer from 'features/topology/topologySlice';
import menuReducer from 'features/menu/menuSlice';
import nsoReducer from 'features/nso/nsoSlice';

const topologyPersistConfig = {
  key: 'topology',
  storage: storage,
  whitelist: [
    'zoomedContainer',
    'expandedIcons',
    'visibleUnderlays',
    'configViewerVisible',
    'iconSize'
  ]
};

const menuPersistConfig = {
  key: 'menu',
  storage: storage,
  whitelist: [ 'openService' ]
};

export const store = configureStore({
  reducer: {
    nso: nsoReducer,
    topology: persistReducer(topologyPersistConfig, topologyReducer),
    menu: persistReducer(menuPersistConfig, menuReducer),
    [jsonRpcApi.reducerPath]: jsonRpcApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['item-dragged',
        FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    },
    immutableCheck: false
  }).concat(jsonRpcApi.middleware),
});
