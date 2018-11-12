import { ICON_SPACING } from '../constants/Layout';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

import layout, * as fromLayout from './layout.js';
import uiState, * as fromUiState from './uiState.js';
import tenants, * as fromTenants from './tenants.js';
import endpoints, * as fromEndpoints from './endpoints.js';
import networkServices, * as fromNetworkServices from './networkServices.js';
import icons, * as fromIcons from './icons.js';
import vnfs, * as fromVnfs from './vnfs.js';
import connections, * as fromConnections from './connections.js';

export default combineReducers({
  layout,
  uiState,
  tenants,
  endpoints,
  networkServices,
  icons,
  vnfs,
  connections
});

const iconPositionSelectors = [];
const iconVnfsSelectors = [];


// === Layout selectors =======================================================

export const getLayoutStateSlice = state => state.layout;

export const getDimensions = state =>
  fromLayout.getDimensions(state.layout);

export const getIconSize = state =>
  fromLayout.getIconSize(state.layout);

export const getActualIconSize = state =>
  fromLayout.getActualIconSize(state.layout);

export const getIconHeightPc = state =>
  fromLayout.getIconHeightPc(state.layout);

export const getLayout = state =>
  fromLayout.getLayout(state.layout);


// === UiState selectors ======================================================

export const getDraggedItem = state =>
  fromUiState.getDraggedItem(state.uiState);

export const getSelectedConnection = state =>
  fromUiState.getSelectedConnection(state.uiState);

export const getSelectedIcon = state =>
  fromUiState.getSelectedIcon(state.uiState);

export const getExpandedIcons = state =>
  fromUiState.getExpandedIcons(state.uiState);

export const getIsIconExpanded = (state, id) =>
  fromUiState.getExpandedIcons(state.uiState).includes(id);

export const getEditMode = state =>
  fromUiState.getEditMode(state.uiState);

export const getBodyOverlayVisible = state =>
  fromUiState.getBodyOverlayVisible(state.uiState);

export const getHasWriteTransaction = state =>
  fromUiState.getHasWriteTransaction(state.uiState);

export const getError = state =>
  fromUiState.getError(state.uiState);


// === Tenants selectors ======================================================

export const getTenants = state =>
  fromTenants.getItems(state.tenants);

export const getIsFetchingTenants = state =>
  fromTenants.getIsFetching(state.tenants);


// === Endpoints selectors ====================================================

export const getEndpoints = state =>
  fromEndpoints.getItems(state.endpoints);

export const getIsFetchingEndpoints = state =>
  fromEndpoints.getIsFetching(state.endpoints);


// === NetworkServices selectors ==============================================

export const getNetworkServices = state =>
  fromNetworkServices.getNetworkServices(state.networkServices);


// === Icons selectors ========================================================

export const getIcons = state =>
  fromIcons.getItems(state.icons);

export const getIsFetchingIcons = state =>
  fromIcons.getIsFetching(state.icons);

export const getIcon = (state, id) =>
  fromIcons.getIcon(state.icons, id);

export const getIconsByDevice = state =>
  fromIcons.getIconsByDevice(state.icons);

export const getIconsByNsInfo = state =>
  fromIcons.getIconsByNsInfo(state.icons);


// === Vnfs selectors =========================================================

export const getVnfs = state =>
  fromVnfs.getItems(state.vnfs);

export const getIsFetchingVnfs = state =>
  fromVnfs.getIsFetching(state.vnfs);

const getIconVnfsFactory = () =>
  createSelector([(state, id) => getIcon(state, id).nsInfoId, getVnfs],
    fromVnfs.getNsInfoVnfs);

export const getIconVnfs = (state, id) => {
  if (!iconVnfsSelectors[id]) {
    iconVnfsSelectors[id] = getIconVnfsFactory();
  }
  return iconVnfsSelectors[id](state, id);
};


// === Connections selectors ==================================================

export const getConnections = state =>
  fromConnections.getItems(state.connections);

export const getIsFetchingConnections = state =>
  fromConnections.getIsFetching(state.connections);

export const getConnection = (state, id) =>
  fromConnections.getConnection(state.connections, id);


// === Cross-slice selectors ==================================================

const calculateIconPosition =
  (id, icon, vnfs, dimensions, layout, iconHeightPc, expanded) => {
  console.debug(`Reselect iconPosition ${id}`);
  if (!dimensions) {
    return null;
  }
  const { x, y, container } = icon;
  const { left, top, width, height } = layout[container || 'provider'].pc;
  const pcX = left + x * width;
  const pcY = top + y * height;
  const ret = {
    [id]: {
      pcX,
      pcY,
      x: Math.round(pcX * dimensions.width / 100),
      y: Math.round(pcY * dimensions.height / 100)
  }};
  const vnfOffset = vnfs && (vnfs.length + 1) * (iconHeightPc * ICON_SPACING) / 2;
  vnfs && vnfs.forEach((vnf, index) => {
    const vnfPcX = pcX;
    const vnfPcY = ( expanded && vnfs.length > 1 )
      ? pcY + (index + 1) * (iconHeightPc * ICON_SPACING) - vnfOffset : pcY;
    ret[vnf.id] = {
      pcX: vnfPcX,
      pcY: vnfPcY,
      x: Math.round(vnfPcX * dimensions.width / 100),
      y: Math.round(vnfPcY * dimensions.height / 100)
    };
  });
  return ret;
};

const getIconPositionFactory = () =>
  createSelector(
    [(state, id) => id, getIcon, getIconVnfs, getDimensions,
      getLayout, getIconHeightPc, getIsIconExpanded],
    calculateIconPosition);

export const getIconPosition = (state, id) => {
  if (!iconPositionSelectors[id]) {
    iconPositionSelectors[id] = getIconPositionFactory();
  }
  return iconPositionSelectors[id](state, id);
};

export const getIconPositions = createSelector(
  [getIcons, getLayoutStateSlice, getVnfs, getExpandedIcons],
  (icons, layout, vnfs, expandedIcons) => {
    console.debug('Reselect iconPositions');
    const state = {
      icons: { items: icons },
      vnfs: { items: vnfs },
      uiState: { expandedIcons },
      layout,
    };
    return Object.keys(icons).reduce((accumulator, key) => ({
      ...accumulator,
      ...getIconPosition(state, key)
    }), {});
  });


// For connections to/from nsInfos, create a connection for each
// connectionPoint directly to the VNF, so when icons are expanded the
// individual connections appear. But don't do this for the
// CustomDragLayer (includeVnfs = false) since nsInfos are collapsed in
// Edit Mode and only want to draw a single connection between icons
// when dragging.
export const calculateConnectionPositions = (
  connections, iconsByDevice, iconsByNsInfo, iconPositions, vnfs, fromIcon
) => Object.keys(connections).reduce((accumulator, key) => {
  console.debug('Reselect connectionPositions');
  const processEndpoint = (device, nsInfoId, cp, includeVnfs) => {
    if (device) { return [ iconsByDevice[device] ]; }

    if (nsInfoId) {
      return includeVnfs ? Object.values(vnfs).filter(vnf =>
          vnf.nsInfoId === nsInfoId && vnf.connectionPoints.includes(cp)
        ).map(({ id }) => id) : [ iconsByNsInfo[nsInfoId] ];
    }

    console.error(`Connection ${key} has a missing endpoint!`);
    return [];
  };

  const { ep1Device, ep1NsInfo, ep1Cp,
          ep2Device, ep2NsInfo, ep2Cp } = connections[key];

  processEndpoint(
    ep1Device, ep1NsInfo, ep1Cp, fromIcon === undefined
  ).forEach((ep1Icon, idx1) => {
    processEndpoint(
      ep2Device, ep2NsInfo, ep2Cp, fromIcon === undefined
    ).forEach((ep2Icon, idx2)=> {
      if (fromIcon && (fromIcon === ep1Icon || fromIcon === ep2Icon)) {
        accumulator.push({
          id: key,
          from: iconPositions[fromIcon === ep1Icon ? ep2Icon : ep1Icon]
        });
      } else if (!fromIcon) {
        if (!(ep1Icon in iconPositions)) {
          console.error(`Skipping connection ${key
            }. Failed to find icon (or calculate position) for endpoint 1`);
        } else if (!(ep2Icon in iconPositions)) {
          console.error(`Skipping connection ${key
            }. Failed to find icon (or calculate position) for endpoint 2`);
        } else {
          accumulator.push({
            key: key + (idx1 + idx2 > 0 ? `-${(idx1 + 1) * (idx2 + 1)}` : ''),
            id: key,
            x1: iconPositions[ep1Icon].x,
            y1: iconPositions[ep1Icon].y,
            x2: iconPositions[ep2Icon].x,
            y2: iconPositions[ep2Icon].y,
            ep1Icon,
            ep2Icon,
            disabled: ep1NsInfo || ep2NsInfo
          });
        }
      }
    });
  });

  return accumulator;
}, []);

export const getConnectionPositions = createSelector([
  getConnections, getIconsByDevice, getIconsByNsInfo, getIconPositions, getVnfs
], calculateConnectionPositions);
