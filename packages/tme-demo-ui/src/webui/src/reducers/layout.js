import * as ActionTypes from '../actions/layout';
import { ICON_INITIAL_MAX_SIZE_PC,
         ICON_INITIAL_MAX_SIZE_PX, LAYOUT } from '../constants/Layout';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export const getDimensions = state => state.dimensions;
export const getIconSize = state => state.iconSize;

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

const getIconWidthPc = createSelector([
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

export const getLayout = createSelector(
  [getDimensions, getIconHeightPc, getIconWidthPc],
  (dimensions, iconHeightPc, iconWidthPc) => {
    console.debug('Reselect layout');
    if (!dimensions) {
      return undefined;
    }
    const { width, height } = dimensions;
    const ratio = width / height;
    let x = -iconWidthPc / 2;
    return LAYOUT.reduce((accumulator, container, index) => {
      const pc = {
        left: x += iconWidthPc,
        right: x += container.width - iconWidthPc,
        top: iconHeightPc / 2,
        bottom: 100 - iconHeightPc,
        width: container.width - iconWidthPc,
        height: 100 - iconHeightPc * 1.5,
        backgroundWidth: (index === 0)
          ? container.width + iconWidthPc / 4
          : (index === (LAYOUT.length - 1))
            ? container.width - iconWidthPc / 4
            : (index % 2)
              ? container.width - iconWidthPc / 2
              : container.width + iconWidthPc / 2
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

export default function(state = { iconSize: null }, action) {
  const { type, left, top, width, height, size } = action;
  switch (type) {

    case ActionTypes.DIMENSIONS_CHANGED:
      return { ...state, dimensions: { left, top, width, height } };

    case ActionTypes.ICON_SIZE_CHANGED:
      return { ...state, iconSize: size };

    default:
      return state;
  }
}
