import * as ActionTypes from '../actions/connections';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';


// === Helpers ================================================================

const endpointDeviceKey = endpoint => `ep${endpoint}Device`;
const endpointNsInfoKey = endpoint => `ep${endpoint}NsInfo`;


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';
export const getConnection = (state, name) => getItems(state)[name];


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_CONNECTIONS_REQUEST,
  ActionTypes.FETCH_CONNECTIONS_SUCCESS,
  ActionTypes.FETCH_CONNECTIONS_FAILURE,
  ActionTypes.CONNECTION_DELETED,
  ActionTypes.CONNECTION_ADDED
],
(state = [], action) => {
  const { type, name, endpoint, device, nsInfo } = action;
  switch (type) {

    case ActionTypes.CONNECTION_MOVED:
      return {
        ...state,
        [name]: {
          ...state[name],
          [endpointDeviceKey(endpoint)]: device,
          [endpointNsInfoKey(endpoint)]: nsInfo
        }
      };

    default:
      return state;
  }
});
