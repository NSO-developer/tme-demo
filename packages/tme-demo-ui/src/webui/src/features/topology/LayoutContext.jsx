import { ICON_VNF_SPACING, ICON_VM_SPACING } from '../constants/Layout';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { roundPc } from '../utils/UiUtils';

import layout, * as fromLayout from './layout.js';
import uiState, * as fromUiState from './uiState.js';
import uiSizing, * as fromUiSizing from './uiSizing.js';
import tenants, * as fromTenants from './tenants.js';
import vpnEndpoints, * as fromVpnEndpoints from './vpnEndpoints.js';
import dcEndpoints, * as fromDcEndpoints from './dcEndpoints.js';
import networkServices, * as fromNetworkServices from './networkServices.js';
import icons, * as fromIcons from './icons.js';
import zoomedIcons, * as fromZoomedIcons from './zoomedIcons.js';
import vnfs, * as fromVnfs from './vnfs.js';
import connections, * as fromConnections from './connections.js';
import devices, * as fromDevices from './devices.js';

const uiSizingPersistConfig = {
  key: 'layout',
  storage: storage,
  whitelist: ['iconSize', 'zoomedContainer']
};

const uiStatePersistConfig = {
  key: 'uiState',
  storage: storage,
  whitelist: [
    'expandedIcons', 'visibleUnderlays', 'openTenant', 'configViewerVisible']
};

export default combineReducers({
  layout,
  uiState: persistReducer(uiStatePersistConfig, uiState),
  uiSizing: persistReducer(uiSizingPersistConfig, uiSizing),
  tenants,
  vpnEndpoints,
  dcEndpoints,
  networkServices,
  icons,
  zoomedIcons,
  vnfs,
  connections,
  devices
});

const iconPositionSelectors = [];
const iconVnfsSelectors = [];

const empty = [];

// === Layout selectors =======================================================

export const getLayoutStateSlice = state => state.layout;

export const getBasicLayout = state =>
  fromLayout.getItems(state.layout);

export const getIsFetchingLayout = state =>
  fromLayout.getIsFetching(state.layout);


// === Ui Sizing selectors ====================================================

export const getUiSizingStateSlice = state => state.uiSizing;

export const getDimensions = state =>
  fromUiSizing.getDimensions(state.uiSizing);

export const getIconSize = state =>
  fromUiSizing.getIconSize(state.uiSizing);

export const calculateInitialIconSize = state =>
  fromUiSizing.calculateInitialIconSize(state.uiSizing);

export const getActualIconSize = state =>
  fromUiSizing.getActualIconSize(state.uiSizing);

export const getIconHeightPc = state =>
  fromUiSizing.getIconHeightPc(state.uiSizing);

export const getIconWidthPc = state =>
  fromUiSizing.getIconWidthPc(state.uiSizing);

export const getZoomedContainer = state =>
  fromUiSizing.getZoomedContainer(state.uiSizing);


// === UiState selectors ======================================================

export const getDraggedItem = state =>
  fromUiState.getDraggedItem(state.uiState);

export const getSelectedConnection = state =>
  fromUiState.getSelectedConnection(state.uiState);

export const getSelectedIcon = state =>
  fromUiState.getSelectedIcon(state.uiState);

export const getExpandedIcons = state =>
  fromUiState.getExpandedIcons(state.uiState);

export const getVisibleUnderlays = state =>
  fromUiState.getVisibleUnderlays(state.uiState);

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

export const getConfigViewerVisible = state =>
  fromUiState.getConfigViewerVisible(state.uiState);

export const getError = state =>
  fromUiState.getError(state.uiState);


// === Tenants selectors ======================================================

export const getTenants = state =>
  fromTenants.getItems(state.tenants);

export const getIsFetchingTenants = state =>
  fromTenants.getIsFetching(state.tenants);

export const getTenant = (state, name) =>
  fromTenants.getTenant(state.tenants, name);


// === VPN Endpoints selectors ================================================

export const getVpnEndpoints = state =>
  fromVpnEndpoints.getItems(state.vpnEndpoints);

export const getIsFetchingVpnEndpoints = state =>
  fromVpnEndpoints.getIsFetching(state.vpnEndpoints);


// === Data Centre Endpoints selectors ========================================

export const getDcEndpoints = state =>
  fromDcEndpoints.getItems(state.dcEndpoints);

export const getIsFetchingDcEndpoints = state =>
  fromDcEndpoints.getIsFetching(state.dcEndpoints);


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


// === Zoomed Icons selectors =================================================

export const getZoomedIcons = state =>
  fromZoomedIcons.getItems(state.zoomedIcons);

export const getIsFetchingZoomedIcons = state =>
  fromZoomedIcons.getIsFetching(state.zoomedIcons);

export const getZoomedIcon = (state, name) =>
  fromZoomedIcons.getZoomedIcon(
      state.zoomedIcons, name, getZoomedContainer(state));


// === Vnfs selectors =========================================================

export const getVnfs = state =>
  fromVnfs.getItems(state.vnfs);

export const getIsFetchingVnfs = state =>
  fromVnfs.getIsFetching(state.vnfs);

const getIconVnfsFactory = () =>
  createSelector([(state, name) => getIcon(state, name).nsInfo, getVnfs],
    fromVnfs.getNsInfoVnfs);

export const getIconVnfs = (state, name) => {
  if (getIcon(state, name).nsInfo) {
    if (!iconVnfsSelectors[name]) {
      iconVnfsSelectors[name] = getIconVnfsFactory();
    }
    return iconVnfsSelectors[name](state, name);
  } else {
    return empty;
  }
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

export const getDevices = state =>
  fromDevices.getItems(state.devices);

export const getDevice = (state, name) =>
  fromDevices.getDevice(state.devices, name);


// === Cross-slice selectors ==================================================

const calculateLayout = (
  basicLayout, dimensions, iconHeightPc, iconWidthPc, zoomedContainerName
) => {
  console.debug('Reselect layout');
  if (!basicLayout || !dimensions) {
    return undefined;
  }
  const { width, height } = dimensions;
  const ratio = width / height;
  let afterZoomed = false;
  let x = -iconWidthPc / 2;
  return basicLayout.reduce((accumulator, container, index) => {
    const containerZoomed = zoomedContainerName === container.name;
    if (containerZoomed) {
      afterZoomed = true;
    }

    const pc = zoomedContainerName ? {
      left: containerZoomed ? iconWidthPc / 2 : afterZoomed ? 100 : 0,
      right: containerZoomed ? 100 - iconWidthPc / 2 : afterZoomed ? 100 : 0,
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
        : (index === (basicLayout.length - 1))
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
};

export const getLayout = createSelector(
  [getBasicLayout, getDimensions, getIconHeightPc, getIconWidthPc,
   getZoomedContainer],
  calculateLayout);

export const getHighlightedDevices = state => {
  const tenant = getTenant(state, getOpenTenant(state));
  return tenant && tenant.deviceList ? tenant.deviceList : undefined;
};

const calculateIconPosition = (name, icon, zoomedIcon, vnfs, dimensions,
  layout, iconHeightPc, expanded, zoomedContainer, visibleUnderlays
) => {
  console.debug(`Reselect iconPosition ${name}`);
  if (!dimensions || !layout) {
    return null;
  }

  const { x, y, container } =
    (zoomedContainer && zoomedIcon) ? zoomedIcon : icon;

  const { connectionColour } = layout[container];
  const hidden = zoomedContainer && container !== zoomedContainer ||
                 icon.underlay == 'true' &&
                 !visibleUnderlays.includes(icon.container);

  const position = (pcX, pcY) => ({
    pcX, pcY,
    x: Math.round(pcX * dimensions.width / 100),
    y: Math.round(pcY * dimensions.height / 100),
    expanded, hidden, connectionColour,
  });

  const { left, top, width, height } = layout[container || 'provider'].pc;
  const pcX = roundPc(left + x * width);
  const pcY = roundPc(top + y * height);
  const ret = {
    [name]: position(pcX, pcY)
  };

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
        const vnfName = `${vnf.name}${vmIndex > 0 ? `-${vmIndex}` : ''}`;
        ret[vnfName] = position(vnfPcX, vnfPcY);
      });
    });
  }
  return ret;
};

const getIconPositionFactory = () =>
  createSelector(
    [(state, name) => name, getIcon, getZoomedIcon, getIconVnfs, getDimensions,
      getLayout, getIconHeightPc, getIsIconExpanded, getZoomedContainer,
      getVisibleUnderlays],
    calculateIconPosition);

export const getIconPosition = (state, name) => {
  if (!iconPositionSelectors[name]) {
    iconPositionSelectors[name] = getIconPositionFactory();
  }
  return iconPositionSelectors[name](state, name);
};

export const getIconPositions = createSelector(
  [getIcons, getZoomedIcons, getLayoutStateSlice, getUiSizingStateSlice,
   getVnfs, getExpandedIcons, getVisibleUnderlays],
  (icons, zoomedIcons, layout, uiSizing, vnfs, expandedIcons,
   visibleUnderlays) => {
    console.debug('Reselect iconPositions');
    const state = {
      icons: { items: icons },
      zoomedIcons: { items: zoomedIcons },
      layout,
      uiSizing,
      vnfs: { items: vnfs },
      uiState: { expandedIcons, visibleUnderlays },
    };
    return Object.keys(icons).reduce((accumulator, key) => ({
      ...accumulator,
      ...getIconPosition(state, key)
    }), {});
  });

export const calculateConnectionPositions = (
  connections, iconsByDevice, iconsByNsInfo, vnfsByDevice,
  vnfs, iconPositions, zoomed, fromIcon
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

    const getEpIconProperty = property =>
      iconPositions[ep1Icon][property] || iconPositions[ep2Icon][property];

    if (!(ep1Icon in iconPositions)) {
      console.error(`Skipping connection ${key
        }. Failed to find icon (or calculate position) for endpoint 1`);
    } else if (!(ep2Icon in iconPositions)) {
      console.error(`Skipping connection ${key
        }. Failed to find icon (or calculate position) for endpoint 2`);
    } else {

      const hidden = getEpIconProperty('hidden');

      if (fromIcon && (fromIcon === ep1Icon || fromIcon === ep2Icon) && !hidden) {
        accumulator.push({
          name: key,
          from: iconPositions[fromIcon === ep1Icon ? ep2Icon : ep1Icon],
        });
      } else if (!fromIcon) {
        accumulator.push({
          key: key,
          name: key,
          x1: iconPositions[ep1Vnf || ep1Icon].x,
          y1: iconPositions[ep1Vnf || ep1Icon].y,
          x2: iconPositions[ep2Vnf || ep2Icon].x,
          y2: iconPositions[ep2Vnf || ep2Icon].y,
          hidden,
          expanded: getEpIconProperty('expanded'),
          colour: getEpIconProperty('connectionColour'),
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
  getVnfs, getIconPositions, getZoomedContainer
], calculateConnectionPositions);
