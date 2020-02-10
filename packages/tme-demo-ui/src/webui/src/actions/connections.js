import { safeKey } from '../utils/UiUtils';

export const CONNECTION_ADDED = 'connection-added';
export const CONNECTION_MOVED = 'connection-moved';
export const CONNECTION_DELETED = 'connection-deleted';

export const FETCH_CONNECTIONS_REQUEST = 'fetch-connections-request';
export const FETCH_CONNECTIONS_SUCCESS = 'fetch-connections-success';
export const FETCH_CONNECTIONS_FAILURE = 'fetch-connections-failure';

export const FETCH_ONE_CONNECTION_REQUEST = 'fetch-one-connection-request';
export const FETCH_ONE_CONNECTION_FAILURE = 'fetch-one-connection-failure';


// === Action Creators ========================================================

export const connectionAdded = (name, ep1Device, ep2Device) => ({
  type: CONNECTION_ADDED, name, item: { ep1Device, ep2Device }
});

export const connectionMoved = (name, endpoint, device) => ({
  type: CONNECTION_MOVED, name, endpoint, device
});

export const connectionDeleted = name => ({
  type: CONNECTION_DELETED, name
});


// === JsonRpc Middleware =====================================================

const path = '/l3vpn:topology/connection';
const selection = [ 'name',
                    'endpoint-1/device',
                    'endpoint-2/device' ];
const resultKeys = [ 'name',
                     'ep1Device',
                     'ep2Device' ];

export const fetchConnections = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : selection,
    resultKeys  : resultKeys,
    objectKey   : 'name'
  },
  types: [
    FETCH_CONNECTIONS_REQUEST,
    FETCH_CONNECTIONS_SUCCESS,
    FETCH_CONNECTIONS_FAILURE
  ],
  errorMessage: 'Failed to fetch connections'
});

export const fetchOneConnection = name => ({
  jsonRpcGetValues: {
    name        : name,
    path        : `${path}{${safeKey(name)}}`,
    leafs       : selection,
    resultKeys  : resultKeys,
  },
  types: [
    FETCH_ONE_CONNECTION_REQUEST,
    CONNECTION_ADDED,
    FETCH_ONE_CONNECTION_FAILURE
  ],
  errorMessage: `Failed to fetch connection ${name}`
});

export const deleteConnection = name => ({
  jsonRpcDelete: { path, name },
  types: [ CONNECTION_DELETED ],
  errorMessage: `Failed to delete connection ${name}`
});

export const addConnection = (name, ep1Device, ep2Device) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${safeKey(name)}}/endpoint-1/device`, value: ep1Device },
    { path: `${path}{${safeKey(name)}}/endpoint-2/device`, value: ep2Device }
  ]},
  actions: [ connectionAdded(name, ep1Device, ep2Device) ],
  errorMessage: `Failed to add connnection ${name}`
});

export const moveConnection = (name, endpoint, device) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${safeKey(name)}}/endpoint-${endpoint}/device`,
      value: device || null }
  ]},
  actions: [ connectionMoved(name, endpoint, device) ],
  errorMessage: `Failed to move connection ${name}`
});


// === Comet Middleware =======================================================

export const subscribeConnections = () => ({
  subscribe: {
    path: path,
    cdbOper: false
  },
  actions: [ fetchOneConnection, connectionDeleted ]
});
