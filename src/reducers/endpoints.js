import * as ActionTypes from '../actions/endpoints';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_ENDPOINTS_REQUEST,
  ActionTypes.FETCH_ENDPOINTS_SUCCESS,
  ActionTypes.FETCH_ENDPOINTS_FAILURE,
  ActionTypes.ENDPOINT_DELETED
]);
