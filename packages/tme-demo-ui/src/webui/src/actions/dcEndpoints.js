import { TENANT_PATH } from './tenants';
import { safeKey } from '../utils/UiUtils';

export const DC_ENDPOINT_DELETED = 'dc-endpoint-deleted';

export const FETCH_DC_ENDPOINTS_REQUEST = 'fetch-dc-endpoints-request';
export const FETCH_DC_ENDPOINTS_SUCCESS = 'fetch-dc-endpoints-success';
export const FETCH_DC_ENDPOINTS_FAILURE = 'fetch-dc-endpoints-failure';


// === jsonRpc Middleware =====================================================

export const fetchDcEndpoints = () => ({
  jsonRpcQuery: {
    xpathExpr   : `${TENANT_PATH}/data-centre/endpoint`,
    selection   : [ '../../name',
                    'device',
                    'compute',
                    'device',
                    'ios-GigabitEthernet',
                    'ios-xr-GigabitEthernet',
                    'ios-xr-TenGigE',
                    'junos-interface',
                    'alu-interface',
                    'nx-Ethernet',
                    'nx-port-channel',
                    'f10-GigabitEthernet',
                    'compute',
                    'connect-multiple-vlans'],
    resultKeys  : [ 'tenant',
                    'name',
                    'name',
                    'Device',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Interface',
                    'Compute',
                    'Connect Multiple VLANS' ]
  },
  types: [
    FETCH_DC_ENDPOINTS_REQUEST,
    FETCH_DC_ENDPOINTS_SUCCESS,
    FETCH_DC_ENDPOINTS_FAILURE
  ],
  errorMessage: 'Failed to fetch data-centre endpoints'
});

export const deleteDcEndpoint = (tenant, name) => ({
  jsonRpcDelete: {
    path: `${TENANT_PATH}{${safeKey(tenant)}}/data-centre/endpoint`,
    name: name,
    key: name
  },
  types: [ DC_ENDPOINT_DELETED ],
  errorMessage: `Failed to delete data-centre endpoint ${name}`
});
