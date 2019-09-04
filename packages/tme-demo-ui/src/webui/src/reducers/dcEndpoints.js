import * as ActionTypes from '../actions/dcEndpoints';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_DC_ENDPOINTS_REQUEST,
  ActionTypes.FETCH_DC_ENDPOINTS_SUCCESS,
  ActionTypes.FETCH_DC_ENDPOINTS_FAILURE,
  ActionTypes.DC_ENDPOINT_DELETED
]);
