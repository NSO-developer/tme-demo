import { TENANT_PATH } from './tenants';
import { safeKey } from '../utils/UiUtils';

export const VPN_ENDPOINT_DELETED = 'vpn-endpoint-deleted';

export const FETCH_VPN_ENDPOINTS_REQUEST = 'fetch-vpn-endpoints-request';
export const FETCH_VPN_ENDPOINTS_SUCCESS = 'fetch-vpn-endpoints-success';
export const FETCH_VPN_ENDPOINTS_FAILURE = 'fetch-vpn-endpoints-failure';


// === jsonRpc Middleware =====================================================

export const fetchVpnEndpoints = () => ({
  jsonRpcQuery: {
    xpathExpr   : `${TENANT_PATH}/l3vpn/endpoint`,
    selection   : [ 'id',
                    '../../name',
                    'ce-device',
                    'ce-interface',
                    'ip-network',
                    'bandwidth',
                    'as-number' ],
    resultKeys  : [ 'name',
                    'tenant',
                    // Following used as label names...
                    'Device',
                    'Interface',
                    'IP Network',
                    'Bandwidth',
                    'AS Number' ]
  },
  types: [
    FETCH_VPN_ENDPOINTS_REQUEST,
    FETCH_VPN_ENDPOINTS_SUCCESS,
    FETCH_VPN_ENDPOINTS_FAILURE
  ],
  errorMessage: 'Failed to fetch VPN endpoints'
});

export const deleteVpnEndpoint = (tenant, name) => ({
  jsonRpcDelete: {
    path: `${TENANT_PATH}{${safeKey(tenant)}}/l3vpn/endpoint`,
    name: name
  },
  types: [ VPN_ENDPOINT_DELETED ],
  errorMessage: `Failed to delete VPN endpoint ${name}`
});
