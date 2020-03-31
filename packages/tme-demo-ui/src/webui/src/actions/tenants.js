import JsonRpc from '../utils/JsonRpc';
import { fetchSidebarData } from './index';
import { safeKey } from '../utils/UiUtils';

export const TENANT_ADDED = 'tenant-added';
export const TENANT_DELETED = 'tenant-deleted';

export const FETCH_TENANTS_REQUEST = 'fetch-tenants-request';
export const FETCH_TENANTS_SUCCESS = 'fetch-tenants-success';
export const FETCH_TENANTS_FAILURE = 'fetch-tenants-failure';

export const FETCH_ONE_TENANT_REQUEST = 'fetch-one-tenant-request';
export const FETCH_ONE_TENANT_FAILURE = 'fetch-one-tenant-failure';

export const TENANT_PATH = '/tme-demo:tme-demo/tenant';


// === Action Creators ========================================================

const tenantDeleted = name => ({
  type: TENANT_DELETED, name
});

// === jsonRpc Middleware =====================================================

const selection = ['name',
                   'l3vpn/route-distinguisher',
                   'l3vpn/qos-policy',
                   'data-centre/ip-network',
                   'data-centre/vlan',
                   'data-centre/preserve-vlan-tags'];
const resultKeys = ['name',
                    'Route Distinguisher',
                    'QoS Policy',
                    'Data Centre IP Network',
                    'Data Centre VLAN',
                    'Preserve VLAN Tags'];

export const fetchTenants = () => ({
  jsonRpcQuery: {
    xpathExpr   : TENANT_PATH,
    selection   : selection,
    resultKeys  : resultKeys,
    transform   : addDeviceList
  },
  types: [
    FETCH_TENANTS_REQUEST,
    FETCH_TENANTS_SUCCESS,
    FETCH_TENANTS_FAILURE
  ],
  errorMessage: 'Failed to fetch tenants'
});

export const fetchOneTenant = name => ({
  jsonRpcGetValues: {
    name        : name,
    path        : `${TENANT_PATH}{${safeKey(name)}}`,
    leafs       : selection,
    resultKeys  : resultKeys,
    transform   : addDeviceList
  },
  types: [
    FETCH_ONE_TENANT_REQUEST,
    TENANT_ADDED,
    FETCH_ONE_TENANT_FAILURE
  ],
  errorMessage: 'Failed to fetch tenant'
});

export const deleteTenant = (name) => ({
  jsonRpcDelete: { path: TENANT_PATH, name },
  types: [ TENANT_DELETED ],
  errorMessage: `Failed to delete tenant ${name}`
});

export const addDeviceList = tenants => Promise.all(
  tenants.map(async tenant => {
    try {
      const deviceListPath = `${TENANT_PATH}{${
        safeKey(tenant.name)}}/modified/devices`;
      if (await JsonRpc.exists(deviceListPath)) {
        const deviceList = await JsonRpc.getValue(deviceListPath);
        return { ...tenant, deviceList: deviceList.value };
      } else {
        return tenant;
      }
    } catch(exception) {
      console.error(`Error retrieving device list for ${tenant.name}`);
      console.log(exception);
      return tenant;
    }
  })
);


// === Comet Middleware =======================================================

export const subscribeTenants = () => ({
  subscribe: {
    path: TENANT_PATH,
    cdbOper: false,
    skipLocal: true,
    skipPlanOnlyChanges: true
  },
  actions: [ fetchSidebarData ]
});
