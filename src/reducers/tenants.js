import * as ActionTypes from '../actions/tenants';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_TENANTS_REQUEST,
  ActionTypes.FETCH_TENANTS_SUCCESS,
  ActionTypes.FETCH_TENANTS_FAILURE,
  ActionTypes.TENANT_DELETED
]);
