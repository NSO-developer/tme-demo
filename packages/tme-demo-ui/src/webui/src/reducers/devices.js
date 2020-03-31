import * as ActionTypes from '../actions/devices';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems } from './jsonRpcWrapper';
export const getDevice = (state, name) => getItems(state)[name];


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_DEVICES_REQUEST,
  ActionTypes.FETCH_DEVICES_SUCCESS,
  ActionTypes.FETCH_DEVICES_FAILURE
]);
