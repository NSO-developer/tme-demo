import * as ActionTypes from '../actions/icons';
import jsonRpcQueryWrapper, { getItems } from './jsonRpcQueryWrapper';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcQueryWrapper';
export const getIcon = (state, id) => getItems(state)[id];

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
    if (icons[key].nsInfoId) {
      acc[icons[key].nsInfoId] = key;
    }
    return acc;
  }, {});
});


// === Reducer ================================================================

// Single icon reducer
const icon = (state = {}, action) => {
  switch (action.type) {

    case ActionTypes.ICON_MOVED:
      return {
        ...state,
        ...action.pos
      };

    default:
      return state;
  }
};

export default jsonRpcQueryWrapper([
  ActionTypes.FETCH_ICONS_REQUEST,
  ActionTypes.FETCH_ICONS_SUCCESS,
  ActionTypes.FETCH_ICONS_FAILURE
],
(state = [], action) => {
  switch (action.type) {

    case ActionTypes.ICON_MOVED:
      return {
        ...state,
        [action.id]: icon(state[action.id], action)
      };

    default:
      return state;
  }
});
