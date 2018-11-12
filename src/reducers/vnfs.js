import * as ActionTypes from '../actions/vnfs';
import jsonRpcQueryWrapper from './jsonRpcQueryWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcQueryWrapper';

// TODO: Return VNFS in order accordinging to internal connections
export const getNsInfoVnfs = (nsInfoId, vnfs) => {
  console.debug(`Reselect nsInfo Vnfs ${nsInfoId}`);
  return Object.keys(vnfs).reduce((accumulator, key) => {
    if (vnfs[key].nsInfoId === nsInfoId) {
      accumulator.push(vnfs[key]);
    }
    return accumulator;
  }, []);
};


// === Reducer ================================================================

export default jsonRpcQueryWrapper([
  ActionTypes.FETCH_VNFS_REQUEST,
  ActionTypes.FETCH_VNFS_SUCCESS,
  ActionTypes.FETCH_VNFS_FAILURE
]);
