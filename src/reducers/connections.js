import * as ActionTypes from '../actions/connections';
import jsonRpcQueryWrapper, { getItems } from './jsonRpcQueryWrapper';


// === Helpers ================================================================

const endpointDeviceKey = endpoint => `ep${endpoint}Device`;
const endpointNsInfoKey = endpoint => `ep${endpoint}NsInfo`;


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcQueryWrapper';
export const getConnection = (state, id) => getItems(state)[id];


// === Reducer ================================================================

export default jsonRpcQueryWrapper([
  ActionTypes.FETCH_CONNECTIONS_REQUEST,
  ActionTypes.FETCH_CONNECTIONS_SUCCESS,
  ActionTypes.FETCH_CONNECTIONS_FAILURE,
  ActionTypes.CONNECTION_DELETED
],
(state = [], action) => {
  const { type, id } = action;
  switch (type) {

    case ActionTypes.CONNECTION_ADDED: {
      const { ep1Device, ep2Device } = action;
      return { ...state, [id]: { ep1Device, ep2Device } };
    }

    case ActionTypes.CONNECTION_MOVED: {
      const { endpoint, device, nsInfo } = action;
      const newState = { ...state };
      newState[id][endpointDeviceKey(endpoint)] = device;
      newState[id][endpointNsInfoKey(endpoint)] = nsInfo;
      return newState;
    }

    default:
      return state;
  }
});
