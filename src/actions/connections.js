export const CONNECTION_ADDED = 'connection-added';
export const CONNECTION_MOVED = 'connection-moved';
export const CONNECTION_DELETED = 'connection-deleted';

export const FETCH_CONNECTIONS_REQUEST = 'fetch-connections-request';
export const FETCH_CONNECTIONS_SUCCESS = 'fetch-connections-success';
export const FETCH_CONNECTIONS_FAILURE = 'fetch-connections-failure';


// === Action Creators ========================================================

export const connectionAdded = (id, ep1Device, ep2Device) => ({
  type: CONNECTION_ADDED, id, ep1Device, ep2Device
});

export const connectionMoved = (id, endpoint, device, nsInfo) => ({
  type: CONNECTION_MOVED, id, endpoint, device, nsInfo
});


// === JsonRpc Middleware =====================================================

const path = '/l3vpn:topology/connection';

export const fetchConnections = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : [ 'name',
                    'endpoint-1/device',
                    'endpoint-1/ns-info-id',
                    'endpoint-1/connection-point',
                    'endpoint-2/device',
                    'endpoint-2/ns-info-id',
                    'endpoint-2/connection-point' ],
    resultKeys  : [ 'name',
                    'ep1Device',
                    'ep1NsInfo',
                    'ep1Cp',
                    'ep2Device',
                    'ep2NsInfo',
                    'ep2Cp' ],
    objectKey   : 'name'
  },
  types: [
    FETCH_CONNECTIONS_REQUEST,
    FETCH_CONNECTIONS_SUCCESS,
    FETCH_CONNECTIONS_FAILURE
  ],
  errorMessage: 'Failed to fetch connections'
});

export const deleteConnection = (name) => ({
  jsonRpcDelete: { path, name },
  types: [ CONNECTION_DELETED ],
  errorMessage: `Failed to delete connection ${name}`
});

export const addConnection = (id, ep1Device, ep2Device) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${id}}/endpoint-1/device`, value: ep1Device },
    { path: `${path}{${id}}/endpoint-2/device`, value: ep2Device }
  ]},
  actions: [ connectionAdded(id, ep1Device, ep2Device) ],
  errorMessage: `Failed to add connnection ${id}`
});

export const moveConnection = (id, endpoint, device, nsInfo) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${id}}/endpoint-${endpoint}/device`,
      value: device || null },
    { path: `${path}{${id}}/endpoint-${endpoint}/ns-info-id`,
      value: nsInfo || null }
  ]},
  actions: [ connectionMoved(id, endpoint, device, nsInfo) ],
  errorMessage: `Failed to move connection ${id}`
});


