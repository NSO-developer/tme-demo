export const ICON_ADDED = 'icon-added';
export const ICON_MOVED = 'icon-moved';
export const ICON_DELETED = 'icon-deleted';

export const FETCH_ICONS_REQUEST = 'fetch-icons-request';
export const FETCH_ICONS_SUCCESS = 'fetch-icons-success';
export const FETCH_ICONS_FAILURE = 'fetch-icons-failure';

export const FETCH_ONE_ICON_REQUEST = 'fetch-one-icon-request';
export const FETCH_ONE_ICON_FAILURE = 'fetch-one-icon-failure';


const safeRound = (n) =>
  Math.min(1, Math.max(0, Number.parseFloat(n).toFixed(4))).toString();


// === Action Creators ========================================================

const iconMoved = (name, x, y) => ({
  type: ICON_MOVED, name, pos: { x, y }
});

const iconDeleted = name => ({
  type: ICON_DELETED, name
});


// === JsonRpc Middleware =====================================================

const path = '/webui:webui/data-stores/static-map/position';
const selection = [ 'id',
                    'device',
                    'ns-info-id',
                    'type',
                    'container',
                    'coord/x',
                    'coord/y' ];
const resultKeys =  [ 'name',
                      'device',
                      'nsInfo',
                      'type',
                      'container',
                      'x',
                      'y' ];

export const fetchIcons = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : selection,
    resultKeys  : resultKeys,
    objectKey   : 'name'
  },
  types: [
    FETCH_ICONS_REQUEST,
    FETCH_ICONS_SUCCESS,
    FETCH_ICONS_FAILURE
  ],
  errorMessage: 'Failed to fetch icons'
});

export const fetchOneIcon = name => ({
  jsonRpcGetValues: {
    name        : name,
    path        : `${path}{${name}}`,
    leafs       : selection,
    resultKeys  : resultKeys
  },
  types: [
    FETCH_ONE_ICON_REQUEST,
    ICON_ADDED,
    FETCH_ONE_ICON_FAILURE
  ],
  errorMessage: 'Failed to fetch icon'
});

export const moveIcon = (name, x, y) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{"${name}"}/coord/x`, value: safeRound(x) },
    { path: `${path}{"${name}"}/coord/y`, value: safeRound(y) }
  ]},
  actions: [ iconMoved(name, safeRound(x), safeRound(y)) ],
  errorMessage: `Failed to move icon ${name}`
});


// === Comet Middleware =======================================================

export const subscribeIcons = () => ({
  subscribe: {
    path:  '/webui:webui/data-stores/l3vpnui:static-map/position',
    cdbOper: false
  },
  actions: [ fetchOneIcon, iconDeleted ]
});
