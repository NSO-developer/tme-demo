import { safeKey } from '../utils/UiUtils';

export const ICON_ADDED = 'icon-added';
export const ICON_MOVED = 'icon-moved';
export const ICON_DELETED = 'icon-deleted';

export const FETCH_ICONS_REQUEST = 'fetch-icons-request';
export const FETCH_ICONS_SUCCESS = 'fetch-icons-success';
export const FETCH_ICONS_FAILURE = 'fetch-icons-failure';

export const FETCH_ONE_ICON_REQUEST = 'fetch-one-icon-request';
export const FETCH_ONE_ICON_FAILURE = 'fetch-one-icon-failure';


// === Action Creators ========================================================

const iconMoved = (name, pos) => ({
  type: ICON_MOVED, name, pos
});

const iconDeleted = name => ({
  type: ICON_DELETED, name
});


// === JsonRpc Middleware =====================================================

const path = '/webui:webui/data-stores/tme-demo-ui:static-map/icon';
const selection = [ 'name',
                    'device',
                    'ns-info',
                    'type',
                    'container',
                    'underlay',
                    'coord/x',
                    'coord/y' ];
const resultKeys =  [ 'name',
                      'device',
                      'nsInfo',
                      'type',
                      'container',
                      'underlay',
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
    path        : `${path}{${safeKey(name)}}`,
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

export const moveIcon = (name, pos) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${safeKey(name)}}/coord/x`, value: pos.x },
    { path: `${path}{${safeKey(name)}}/coord/y`, value: pos.y }
  ]},
  actions: [ iconMoved(name, pos) ],
  errorMessage: `Failed to move icon ${name}`
});


// === Comet Middleware =======================================================

export const subscribeIcons = () => ({
  subscribe: {
    path: path,
    cdbOper: false
  },
  actions: [ fetchOneIcon, iconDeleted ]
});
