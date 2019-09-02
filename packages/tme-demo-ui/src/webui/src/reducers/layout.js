import * as ActionTypes from '../actions/layout';
import { ICON_INITIAL_MAX_SIZE_PC,
         ICON_INITIAL_MAX_SIZE_PX, LAYOUT } from '../constants/Layout';
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
  [getDimensions, getIconHeightPc, getIconWidthPc, getZoomedContainer],
  (dimensions, iconHeightPc, iconWidthPc, zoomedContainerName) => {
    console.debug('Reselect layout');
    if (!dimensions) {
      return undefined;
    }
    const { width, height } = dimensions;
    const ratio = width / height;
    let afterZoomed = false;
    let x = -iconWidthPc / 2;
    return LAYOUT.reduce((accumulator, container, index) => {
      const containerZoomed = zoomedContainerName === container.name;
      if (containerZoomed) {
        afterZoomed = true;
      }

      const pc = zoomedContainerName ? {
        left: containerZoomed ? iconWidthPc / 2 : afterZoomed ? 100 : 0,
        right: containerZoomed ? 100 - iconWidthPc / 2: afterZoomed ? 100 : 0,
        top: iconHeightPc / 2,
        bottom: 100 - iconHeightPc,
        width: containerZoomed ? 100 - iconWidthPc : 0,
        height: 100 - iconHeightPc * 1.5,
        backgroundWidth: containerZoomed && !container.zoomed ? 100 : 0
      } : {
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
        index,
        title: container.title,
        connectionColour: container.connectionColour,
        pc,
        px: {
          left: Math.round(pc.left * width / 100),
          right: Math.round(pc.right * width / 100),
          top: Math.round(pc.top * height / 100),
          bottom: Math.round(pc.bottom * height / 100)
        }
      };

      if (container.zoomed) {
        container.zoomed.forEach((zoomedContainer, index) => {
          accumulator[`${container.name}-${index}`] = {
            index,
            parentName: container.name,
            title: zoomedContainer.title,
            pc: {
              backgroundWidth: containerZoomed ? zoomedContainer.width : 0
            }
          };
        });
      }
      return accumulator;
    }, {});
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
