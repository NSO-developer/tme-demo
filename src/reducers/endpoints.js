import * as ActionTypes from '../actions/endpoints';
import jsonRpcQueryWrapper from './jsonRpcQueryWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcQueryWrapper';


// === Reducer ================================================================

export default jsonRpcQueryWrapper([
  ActionTypes.FETCH_ENDPOINTS_REQUEST,
  ActionTypes.FETCH_ENDPOINTS_SUCCESS,
  ActionTypes.FETCH_ENDPOINTS_FAILURE,
  ActionTypes.ENDPOINT_DELETED
]);
