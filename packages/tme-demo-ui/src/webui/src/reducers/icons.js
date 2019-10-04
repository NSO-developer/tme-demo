import * as ActionTypes from '../actions/icons';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';
export const getIcon = (state, name) => getItems(state)[name];

export const getIconsByDevice = createSelector(getItems, icons => {
  console.debug('Reselect iconsByDevice');
  return Object.keys(icons).reduce((acc, key) => {
    if (icons[key].device) {
      acc[icons[key].device] = key;
    }
    return acc;
  }, {});
});

export const getIconsByNsInfo = createSelector(getItems, icons => {
  console.debug('Reselect iconsByNsInfo');
  return Object.keys(icons).reduce((acc, key) => {
    if (icons[key].nsInfo) {
      acc[icons[key].nsInfo] = key;
    }
    return acc;
  }, {});
});


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_ICONS_REQUEST,
  ActionTypes.FETCH_ICONS_SUCCESS,
  ActionTypes.FETCH_ICONS_FAILURE,
  ActionTypes.ICON_DELETED,
  ActionTypes.ICON_ADDED
],
(state = {}, action) => {
  const { type, name, pos } = action;
  switch (type) {

    case ActionTypes.ICON_MOVED:
      return {
        ...state,
        [name]: { ...state[name], ...pos }
      };

    default:
      return state;
  }
});
