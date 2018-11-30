import { ICON_VNF_SPACING, ICON_VM_SPACING } from '../constants/Layout';
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

export const getIsIconExpanded = (state, name) =>
  fromUiState.getExpandedIcons(state.uiState).includes(name);

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

export const getIcon = (state, name) =>
  fromIcons.getIcon(state.icons, name);

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
  createSelector([(state, name) => getIcon(state, name).nsInfo, getVnfs],
    fromVnfs.getNsInfoVnfs);

export const getIconVnfs = (state, name) => {
  if (!iconVnfsSelectors[name]) {
    iconVnfsSelectors[name] = getIconVnfsFactory();
  }
  return iconVnfsSelectors[name](state, name);
};


// === Connections selectors ==================================================

export const getConnections = state =>
  fromConnections.getItems(state.connections);

export const getIsFetchingConnections = state =>
  fromConnections.getIsFetching(state.connections);

export const getConnection = (state, name) =>
  fromConnections.getConnection(state.connections, name);


// === Cross-slice selectors ==================================================

const calculateIconPosition =
  (name, icon, vnfs, dimensions, layout, iconHeightPc, expanded) => {
  console.debug(`Reselect iconPosition ${name}`);
  if (!dimensions) {
    return null;
  }
  const { x, y, container } = icon;
  const { left, top, width, height } = layout[container || 'provider'].pc;
  const pcX = left + x * width;
  const pcY = top + y * height;
  const ret = {
    [name]: {
      pcX,
      pcY,
      x: Math.round(pcX * dimensions.width / 100),
      y: Math.round(pcY * dimensions.height / 100),
      expanded: expanded
  }};
  if (vnfs) {
    const vnfOffset = ((vnfs.length + 1) * ICON_VNF_SPACING +
      vnfs.reduce((accumulator, vnf) => accumulator +=
        (vnf.vmDevices.length - 1) * ICON_VM_SPACING, 0)) * iconHeightPc / 2;

    let vmOffset = 0;
    vnfs && vnfs.forEach((vnf, vnfIndex) => {
      vnf.vmDevices.forEach((vm, vmIndex) => {
        if (vmIndex > 0) { vmOffset++; }
        const vnfPcX = pcX;
        const vnfPcY = (expanded && vnfs.length > 1)
          ? pcY + ((vnfIndex + 1) * ICON_VNF_SPACING +
            vmOffset * ICON_VM_SPACING) * iconHeightPc  - vnfOffset
          : pcY;
        ret[`${vnf.name}${vmIndex > 0 ? `-${vmIndex}` : ''}`] = {
          pcX: vnfPcX,
          pcY: vnfPcY,
          x: Math.round(vnfPcX * dimensions.width / 100),
          y: Math.round(vnfPcY * dimensions.height / 100),
          expanded: expanded
        };
      });
    });
  }
  return ret;
};

const getIconPositionFactory = () =>
  createSelector(
    [(state, name) => name, getIcon, getIconVnfs, getDimensions,
      getLayout, getIconHeightPc, getIsIconExpanded],
    calculateIconPosition);

export const getIconPosition = (state, name) => {
  if (!iconPositionSelectors[name]) {
    iconPositionSelectors[name] = getIconPositionFactory();
  }
  return iconPositionSelectors[name](state, name);
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
) => {
  console.debug('Reselect connectionPositions');
  return Object.keys(connections).reduce((accumulator, key) => {
    const processEndpoint = (device, nsInfo, cp, includeVnfs) => {
      if (device) { return [ iconsByDevice[device] ]; }

      if (nsInfo) {
        return includeVnfs ? Object.values(vnfs).filter(vnf =>
            vnf.nsInfo === nsInfo && vnf.sapds.includes(cp)
          ).map(({ name }) => name) : [ iconsByNsInfo[nsInfo] ];
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
            name: key,
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
              name: key,
              x1: iconPositions[ep1Icon].x,
              y1: iconPositions[ep1Icon].y,
              x2: iconPositions[ep2Icon].x,
              y2: iconPositions[ep2Icon].y,
              expanded: iconPositions[ep1Icon].expanded ||
                        iconPositions[ep2Icon].expanded,
              ep1Icon,
              ep2Icon,
              disabled: !!(ep1NsInfo || ep2NsInfo)
            });
          }
        }
      });
    });

    return accumulator;
  }, []);
};

export const getConnectionPositions = createSelector([
  getConnections, getIconsByDevice, getIconsByNsInfo, getIconPositions, getVnfs
], calculateConnectionPositions);
