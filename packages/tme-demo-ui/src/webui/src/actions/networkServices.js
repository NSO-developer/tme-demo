import { TENANT_PATH } from './tenants';
import { safeKey } from '../utils/UiUtils';

export const NETWORK_SERVICE_DELETED = 'network-service-deleted';

export const FETCH_NETWORK_SERVICES_REQUEST = 'fetch-network-services-request';
export const FETCH_NETWORK_SERVICES_SUCCESS = 'fetch-network-services-success';
export const FETCH_NETWORK_SERVICES_FAILURE = 'fetch-network-services-failure';


// === jsonRpc Middleware =====================================================

export const fetchNetworkServices = () => ({
  jsonRpcQuery: {
    xpathExpr   : `${TENANT_PATH}/nfvo/network-service`,
    selection   : [ 'name',
                    '../../name',
                    'nsd',
                    'flavour',
                    'vnfm' ],
    resultKeys  : [ 'name',
                    'tenant',
                    // Following used as label names...
                    'NSD',
                    'Flavour',
                    'VNFM' ]
  },
  types: [
    FETCH_NETWORK_SERVICES_REQUEST,
    FETCH_NETWORK_SERVICES_SUCCESS,
    FETCH_NETWORK_SERVICES_FAILURE
  ],
  errorMessage: 'Failed to fetch network services'
});

export const deleteNetworkService = (tenant, name) => ({
  jsonRpcDelete: {
    path: `${TENANT_PATH}{${safeKey(tenant)}}/nfvo/network-service`,
    name: name
  },
  types: [ NETWORK_SERVICE_DELETED ],
  errorMessage: `Failed to delete network service ${name}`
});
