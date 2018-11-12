import * as ActionTypes from '../actions/tenants';
import jsonRpcQueryWrapper from './jsonRpcQueryWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcQueryWrapper';


// === Reducer ================================================================

export default jsonRpcQueryWrapper([
  ActionTypes.FETCH_TENANTS_REQUEST,
  ActionTypes.FETCH_TENANTS_SUCCESS,
  ActionTypes.FETCH_TENANTS_FAILURE,
  ActionTypes.TENANT_DELETED
]);
