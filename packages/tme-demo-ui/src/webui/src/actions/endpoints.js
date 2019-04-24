import { TENANT_PATH } from './tenants';

export const ENDPOINT_DELETED = 'endpoint-deleted';

export const FETCH_ENDPOINTS_REQUEST = 'fetch-endpoints-request';
export const FETCH_ENDPOINTS_SUCCESS = 'fetch-endpoints-success';
export const FETCH_ENDPOINTS_FAILURE = 'fetch-endpoints-failure';


// === jsonRpc Middleware =====================================================

export const fetchEndpoints = () => ({
  jsonRpcQuery: {
    xpathExpr   : `${TENANT_PATH}/l3vpn/endpoint`,
    selection   : [ 'id',
                    '../../name',
                    'ce-device',
                    'ce-interface',
                    'ip-network',
                    'bandwidth',
                    'qos-policy' ],
    resultKeys  : [ 'name',
                    'tenant',
                    // Following used as label names...
                    'Device',
                    'Interface',
                    'IP Network',
                    'Bandwidth',
                    'QoS Policy' ]
  },
  types: [
    FETCH_ENDPOINTS_REQUEST,
    FETCH_ENDPOINTS_SUCCESS,
    FETCH_ENDPOINTS_FAILURE
  ],
  errorMessage: 'Failed to fetch endpoints'
});

export const deleteEndpoint = (tenant, name) => ({
  jsonRpcDelete: {
    path: `${TENANT_PATH}{${tenant}}/l3vpn/endpoint`,
    name: name
  },
  types: [ ENDPOINT_DELETED ],
  errorMessage: `Failed to delete endpoint ${name}`
});
