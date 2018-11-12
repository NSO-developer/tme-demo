export const ICON_MOVED = 'icon-moved';

export const FETCH_ICONS_REQUEST = 'fetch-icons-request';
export const FETCH_ICONS_SUCCESS = 'fetch-icons-success';
export const FETCH_ICONS_FAILURE = 'fetch-icons-failure';


const safeRound = (n) =>
  Math.min(1, Math.max(0, Number.parseFloat(n).toFixed(4))).toString();


// === Action Creators ========================================================

const iconMoved = (id, x, y) => ({
  type: ICON_MOVED, id, pos: { x, y }
});


// === JsonRpc Middleware =====================================================

const path = '/webui:webui/data-stores/static-map/position';

export const fetchIcons = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : [ 'id',
                    'device',
                    'ns-info-id',
                    'type',
                    'container',
                    'coord/x',
                    'coord/y' ],
    resultKeys  : [ 'id',
                    'device',
                    'nsInfoId',
                    'type',
                    'container',
                    'x',
                    'y' ],
    objectKey   : 'id'
  },
  types: [
    FETCH_ICONS_REQUEST,
    FETCH_ICONS_SUCCESS,
    FETCH_ICONS_FAILURE
  ],
  errorMessage: 'Failed to fetch icons'
});

export const moveIcon = (id, x, y) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{"${id}"}/coord/x`, value: safeRound(x) },
    { path: `${path}{"${id}"}/coord/y`, value: safeRound(y) }
  ]},
  actions: [ iconMoved(id, x, y) ],
  errorMessage: `Failed to move icon ${id}`
});
