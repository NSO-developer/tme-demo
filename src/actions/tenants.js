export const TENANT_DELETED = 'tenant-deleted';

export const FETCH_TENANTS_REQUEST = 'fetch-tenants-request';
export const FETCH_TENANTS_SUCCESS = 'fetch-tenants-success';
export const FETCH_TENANTS_FAILURE = 'fetch-tenants-failure';


// === jsonRpc Middleware =====================================================

const path = '/l3vpn:vpn/l3vpn';

export const fetchTenants = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : ['name', 'as-number'],
    resultKeys  : ['name', 'As Number']
  },
  types: [
    FETCH_TENANTS_REQUEST,
    FETCH_TENANTS_SUCCESS,
    FETCH_TENANTS_FAILURE
  ]
});

export const deleteTenant = (name) => ({
  jsonRpcDelete: { path, name },
  types: [ TENANT_DELETED ],
  errorMessage: `Failed to delete tenant ${name}`
});
