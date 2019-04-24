import * as ActionTypes from '../actions/networkServices';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_NETWORK_SERVICES_REQUEST,
  ActionTypes.FETCH_NETWORK_SERVICES_SUCCESS,
  ActionTypes.FETCH_NETWORK_SERVICES_FAILURE,
  ActionTypes.NETWORK_SERVICE_DELETED
]);
