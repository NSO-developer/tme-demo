import * as ActionTypes from '../actions/uiSizing';
import { ICON_INITIAL_MAX_SIZE_PC,
         ICON_INITIAL_MAX_SIZE_PX } from '../constants/Layout';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export const getDimensions = state => state.dimensions;
export const getIconSize = state => state.iconSize;
export const getZoomedContainer = state => state.zoomedContainer;

export const calculateInitialIconSize = state => {
  const dimensions = getDimensions(state);
  if (!dimensions) {
    return null;
  }
  const { width, height } = dimensions;
  const sizePc = ICON_INITIAL_MAX_SIZE_PX / Math.min(width, height) * 100;
  return Math.min(Math.ceil(sizePc), ICON_INITIAL_MAX_SIZE_PC);
};

export const getActualIconSize = createSelector(
  [getDimensions, getIconSize],
  (dimensions, iconSize) => {
    console.debug('Reselect iconSize');
    if (!dimensions) {
      return undefined;
    }
    const { width, height } = dimensions;
    return Math.round(width > height ?
      iconSize * height / 100 : iconSize * width / 100);
  }
);

export const getIconHeightPc = createSelector([
  getDimensions, getIconSize],
  (dimensions, iconSize) => {
    console.debug('Reselect iconHeightPc');
    if (!dimensions) {
      return undefined;
    }
    const { width, height } = dimensions;
    return height > width ? iconSize * width / height : iconSize;
  }
);

export const getIconWidthPc = createSelector([
  getDimensions, getIconSize],
  (dimensions, iconSize) => {
    console.debug('Reselect iconWidthPc');
    if (!dimensions) {
      return undefined;
    }
    const { width, height } = dimensions;
    return width > height ? iconSize * height / width : iconSize;
  }
);


// === Reducer ================================================================

export default function(state = { iconSize: null }, action) {
  const { name, type, left, top, width, height, size } = action;
  switch (type) {

    case ActionTypes.DIMENSIONS_CHANGED:
      return { ...state, dimensions: { left, top, width, height } };

    case ActionTypes.ICON_SIZE_CHANGED:
      return { ...state, iconSize: size };

    case ActionTypes.CONTAINER_ZOOM_TOGGLED: {
      return {
        ...state,
        zoomedContainer: state.zoomedContainer === name ? null : name
      };
    }

    default:
      return state;
  }
}
