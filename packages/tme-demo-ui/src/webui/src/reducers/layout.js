import * as ActionTypes from '../actions/layout';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_LAYOUT_REQUEST,
  ActionTypes.FETCH_LAYOUT_SUCCESS,
  ActionTypes.FETCH_LAYOUT_FAILURE
]);
