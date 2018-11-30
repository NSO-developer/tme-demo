import * as ActionTypes from '../actions/layout';
import { LAYOUT, ICON_BASE_SIZE } from '../constants/Layout';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export const getDimensions = state => state.dimensions;
export const getIconSize = state => state.iconSize;

export const getActualIconSize = createSelector(
  [getDimensions, getIconSize],
  (dimensions, iconSize) => {
    console.debug('Reselect iconSize');
    if (!dimensions) {
      return null;
    }
    const { width, height } = dimensions;
    return Math.round(width > height ?
      iconSize * height / 100 : iconSize * width / 100);
  }
);

export const getIconHeightPc = createSelector([
  getDimensions, getIconSize],
  ({ width, height}, iconSize) => {
    console.debug('Reselect iconHeightPc');
    return height > width ? iconSize * width / height : iconSize;
  }
);

const getIconWidthPc = createSelector([
  getDimensions, getIconSize],
  ({ width, height}, iconSize) => {
    console.debug('Reselect iconWidthPc');
    return width > height ? iconSize * height / width : iconSize;
  }
);

export const getLayout = createSelector(
  [getDimensions, getIconHeightPc, getIconWidthPc],
  (dimensions, iconHeightPc, iconWidthPc) => {
    console.debug('Reselect layout');
    if (!dimensions) {
      return null;
    }
    const { width, height } = dimensions;
    const ratio = width / height;
    let x = -iconWidthPc / 2;
    return LAYOUT.reduce((accumulator, container) => {
      const pc = {
        left: x += iconWidthPc,
        right: x += container.width - iconWidthPc,
        top: iconHeightPc / 2,
        bottom: 100 - iconHeightPc,
        width: container.width - iconWidthPc,
        height: 100 - iconHeightPc * 1.5
      };
      accumulator[container.name] = {
        pc,
        px: {
          left: Math.round(pc.left * width / 100),
          right: Math.round(pc.right * width / 100),
          top: Math.round(pc.top * height / 100),
          bottom: Math.round(pc.bottom * height / 100)
        }
      };
      return accumulator;
    }, {});
  }
);


// === Reducer ================================================================

export default function(state = { iconSize: ICON_BASE_SIZE }, action) {
  switch (action.type) {
    case ActionTypes.DIMENSIONS_CHANGED:
      return { ...state, dimensions: {
        width: action.width,
        height: action.height
      }};
    case ActionTypes.ICON_SIZE_CHANGED:
      return { ...state, iconSize: action.size };
    default:
      return state;
  }
}
