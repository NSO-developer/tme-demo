import * as ActionTypes from '../actions/zoomedIcons';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';
export const getZoomedIcon = (state, iconName, containerName) =>
  getItems(state).find(icon => icon.name === iconName &&
                               icon.container == containerName);


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_ZOOMED_ICONS_REQUEST,
  ActionTypes.FETCH_ZOOMED_ICONS_SUCCESS,
  ActionTypes.FETCH_ZOOMED_ICONS_FAILURE
],
(state = [], action) => {
  const { type, name, pos, container } = action;
  switch (type) {

    case ActionTypes.ZOOMED_ICON_MOVED:
      return state.map(icon => {
        if (icon.name === name && icon.container === container) {
          return { ...icon, ...pos };
        } else {
          return icon;
        }
      });

    default:
      return state;
  }
});
