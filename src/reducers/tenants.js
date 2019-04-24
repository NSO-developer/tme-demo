import * as ActionTypes from '../actions/tenants';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';
export const getTenant = (state, name) => getItems(state).find(
  tenant => tenant.name === name
);


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_TENANTS_REQUEST,
  ActionTypes.FETCH_TENANTS_SUCCESS,
  ActionTypes.FETCH_TENANTS_FAILURE,
  ActionTypes.TENANT_DELETED
]);
