export const DIMENSIONS_CHANGED = 'dimensions-changed';
export const ICON_SIZE_CHANGED = 'icon-size-changed';


// === Action Creators ========================================================

export function dimensionsChanged(left, top, width, height) {
  return { type: DIMENSIONS_CHANGED, left, top, width, height };
}

export function iconSizeChanged(size) {
  return { type: ICON_SIZE_CHANGED, size };
}
