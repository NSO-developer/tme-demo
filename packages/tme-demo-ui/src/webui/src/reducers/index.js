import { ICON_VNF_SPACING, ICON_VM_SPACING } from '../constants/Layout';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { roundPc } from '../utils/UiUtils';

import layout, * as fromLayout from './layout.js';
import uiState, * as fromUiState from './uiState.js';
import tenants, * as fromTenants from './tenants.js';
import endpoints, * as fromEndpoints from './endpoints.js';
import networkServices, * as fromNetworkServices from './networkServices.js';
import icons, * as fromIcons from './icons.js';
import vnfs, * as fromVnfs from './vnfs.js';
import connections, * as fromConnections from './connections.js';
import devices, * as fromDevices from './devices.js';

const layoutPersistConfig = {
  key: 'layout',
  storage: storage,
  whitelist: ['iconSize']
};

const uiStatePersistConfig = {
  key: 'uiState',
  storage: storage,
  whitelist: ['expandedIcons', 'openTenant']
};

export default combineReducers({
  layout: persistReducer(layoutPersistConfig, layout),
  uiState: persistReducer(uiStatePersistConfig, uiState),
  tenants,
  endpoints,
  networkServices,
  icons,
  vnfs,
  connections,
  devices
});

const iconPositionSelectors = [];
const iconVnfsSelectors = [];


// === Layout selectors =======================================================

export const getLayoutStateSlice = state => state.layout;

export const getDimensions = state =>
  fromLayout.getDimensions(state.layout);

export const getIconSize = state =>
  fromLayout.getIconSize(state.layout);

export const calculateInitialIconSize = state =>
  fromLayout.calculateInitialIconSize(state.layout);

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

export const getNewNetworkService = state =>
  fromUiState.getNewNetworkService(state.uiState);

export const getOpenTenant = state =>
  fromUiState.getOpenTenant(state.uiState);

export const getEditMode = state =>
  fromUiState.getEditMode(state.uiState);

export const getBodyOverlayVisible = state =>
  fromUiState.getBodyOverlayVisible(state.uiState);

export const getHasWriteTransaction = state =>
  fromUiState.getHasWriteTransaction(state.uiState);

export const getCommitInProgress = state =>
  fromUiState.getCommitInProgress(state.uiState);

export const getError = state =>
  fromUiState.getError(state.uiState);


// === Tenants selectors ======================================================

export const getTenants = state =>
  fromTenants.getItems(state.tenants);

export const getIsFetchingTenants = state =>
  fromTenants.getIsFetching(state.tenants);

export const getTenant = (state, name) =>
  fromTenants.getTenant(state.tenants, name);


// === Endpoints selectors ====================================================

export const getEndpoints = state =>
  fromEndpoints.getItems(state.endpoints);

export const getIsFetchingEndpoints = state =>
  fromEndpoints.getIsFetching(state.endpoints);


// === NetworkServices selectors ==============================================

export const getNetworkServices = state =>
  fromNetworkServices.getItems(state.networkServices);

export const getIsFetchingNetworkServices = state =>
  fromNetworkServices.getIsFetching(state.networkServices);


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

export const getVnfsByDevice = state =>
  fromVnfs.getVnfsByDevice(state.vnfs);


// === Connections selectors ==================================================

export const getConnections = state =>
  fromConnections.getItems(state.connections);

export const getIsFetchingConnections = state =>
  fromConnections.getIsFetching(state.connections);

export const getConnection = (state, name) =>
  fromConnections.getConnection(state.connections, name);


// === Devices selectors ======================================================

export const getDevice = (state, name) =>
  fromDevices.getDevice(state.devices, name);


// === Cross-slice selectors ==================================================

export const getHighlightedDevices = state => {
  const tenant = getTenant(state, getOpenTenant(state));
  return tenant && tenant.deviceList ? tenant.deviceList : undefined;
};

const calculateIconPosition =
  (name, icon, vnfs, dimensions, layout, iconHeightPc, expanded) => {
  console.debug(`Reselect iconPosition ${name}`);
  if (!dimensions) {
    return null;
  }
  const { x, y, container } = icon;
  const { left, top, width, height } = layout[container || 'provider'].pc;
  const pcX = roundPc(left + x * width);
  const pcY = roundPc(top + y * height);
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
          ? roundPc(pcY + ((vnfIndex + 1) * ICON_VNF_SPACING +
            vmOffset * ICON_VM_SPACING) * iconHeightPc  - vnfOffset)
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


export const calculateConnectionPositions = (
  connections, iconsByDevice, iconsByNsInfo, vnfsByDevice,
  vnfs, iconPositions, fromIcon
) => {
  console.debug('Reselect connectionPositions');
  return Object.keys(connections).reduce((accumulator, key) => {
    const getEndpointIcon = (device, returnVnf) => {
      if (device) {
        if (device in iconsByDevice) {
          return [ iconsByDevice[device], false ];
        } else if (device in vnfsByDevice) {
          const vnf = vnfs[vnfsByDevice[device]];
          return [ iconsByNsInfo[vnf.nsInfo], vnf.name ];
        }
      }
      console.error(`Connection ${key} has a missing endpoint!`);
      return [];
    };

    const { ep1Device, ep2Device } = connections[key];

    const [ ep1Icon, ep1Vnf ] = getEndpointIcon(ep1Device);
    const [ ep2Icon, ep2Vnf ] = getEndpointIcon(ep2Device);

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
          key: key,
          name: key,
          x1: iconPositions[ep1Vnf || ep1Icon].x,
          y1: iconPositions[ep1Vnf || ep1Icon].y,
          x2: iconPositions[ep2Vnf || ep2Icon].x,
          y2: iconPositions[ep2Vnf || ep2Icon].y,
          expanded: iconPositions[ep1Icon].expanded ||
                    iconPositions[ep2Icon].expanded,
          ep1Icon: ep1Icon,
          ep2Icon: ep2Icon,
          disabled: !!(ep1Vnf || ep2Vnf)
        });
      }
    }
    return accumulator;
  }, []);
};

export const getConnectionPositions = createSelector([
  getConnections, getIconsByDevice, getIconsByNsInfo, getVnfsByDevice,
  getVnfs, getIconPositions
], calculateConnectionPositions);
