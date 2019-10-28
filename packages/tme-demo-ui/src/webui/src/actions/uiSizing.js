export const DIMENSIONS_CHANGED = 'dimensions-changed';
export const ICON_SIZE_CHANGED = 'icon-size-changed';
export const CONTAINER_ZOOM_TOGGLED = 'container-zoom-toggled';


// === Action Creators ========================================================

export const dimensionsChanged = (left, top, width, height) => ({
  type: DIMENSIONS_CHANGED, left, top, width, height
});

export const iconSizeChanged = size => ({
  type: ICON_SIZE_CHANGED, size
});

export const containerZoomToggled = name => ({
  type: CONTAINER_ZOOM_TOGGLED, name
});

