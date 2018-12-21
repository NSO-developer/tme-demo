import JsonRpc from '../utils/JsonRpc';

export const TENANT_ADDED = 'tenant-added';
export const TENANT_DELETED = 'tenant-deleted';

export const FETCH_TENANTS_REQUEST = 'fetch-tenants-request';
export const FETCH_TENANTS_SUCCESS = 'fetch-tenants-success';
export const FETCH_TENANTS_FAILURE = 'fetch-tenants-failure';

export const FETCH_ONE_TENANT_REQUEST = 'fetch-one-tenant-request';
export const FETCH_ONE_TENANT_FAILURE = 'fetch-one-tenant-failure';


// === Action Creators ========================================================

const tenantDeleted = name => ({
  type: TENANT_DELETED, name
});

// === jsonRpc Middleware =====================================================

const path = '/l3vpn:vpn/l3vpn';
const selection = ['name', 'as-number'];
const resultKeys = ['name', 'As Number'];

export const fetchTenants = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
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
    path        : `${path}{${name}}`,
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
  jsonRpcDelete: { path, name },
  types: [ TENANT_DELETED ],
  errorMessage: `Failed to delete tenant ${name}`
});

export const addDeviceList = tenants => Promise.all(
  tenants.map(async tenant => {
    try {
      const deviceListPath = `${path}{${tenant.name}}/device-list`;
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
