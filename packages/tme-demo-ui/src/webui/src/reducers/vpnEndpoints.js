import * as ActionTypes from '../actions/vpnEndpoints';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_VPN_ENDPOINTS_REQUEST,
  ActionTypes.FETCH_VPN_ENDPOINTS_SUCCESS,
  ActionTypes.FETCH_VPN_ENDPOINTS_FAILURE,
  ActionTypes.VPN_ENDPOINT_DELETED
]);
