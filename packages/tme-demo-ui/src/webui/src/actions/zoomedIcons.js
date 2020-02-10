import { safeKey } from '../utils/UiUtils';

export const ZOOMED_ICON_MOVED = 'zoomed-icon-moved';

export const FETCH_ZOOMED_ICONS_REQUEST = 'fetch-zoomed-icons-request';
export const FETCH_ZOOMED_ICONS_SUCCESS = 'fetch-zoomed-icons-success';
export const FETCH_ZOOMED_ICONS_FAILURE = 'fetch-zoomed-icons-failure';

// === Action Creators ========================================================

const zoomedIconMoved = (name, container, pos) => ({
  type: ZOOMED_ICON_MOVED, name, container, pos
});


// === JsonRpc Middleware =====================================================

const path = '/webui:webui/data-stores/tme-demo-ui:static-map/icon';
const selection = [ '../name', 'container', 'coord/x', 'coord/y' ];
const resultKeys =  [ 'name', 'container', 'x', 'y' ];

export const fetchZoomedIcons = () => ({
  jsonRpcQuery: {
    xpathExpr   : `${path}/zoomed`,
    selection   : selection,
    resultKeys  : resultKeys
  },
  types: [
    FETCH_ZOOMED_ICONS_REQUEST,
    FETCH_ZOOMED_ICONS_SUCCESS,
    FETCH_ZOOMED_ICONS_FAILURE
  ],
  errorMessage: 'Failed to fetch zoomed icons'
});

export const moveZoomedIcon = (name, pos, container) => {
  const iconPath = `${path}{${safeKey(name)}}/zoomed{${safeKey(container)}}`;

  return {
    jsonRpcSetValues: { pathValues: [
      { path: `${iconPath}/coord/x`, value: pos.x },
      { path: `${iconPath}/coord/y`, value: pos.y }
    ]},
    actions: [ zoomedIconMoved(name, container, pos) ],
    errorMessage: `Failed to move zoomed icon ${name}`
  };
};
