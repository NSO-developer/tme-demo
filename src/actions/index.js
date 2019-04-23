/* Action naming:
 *
 * Complex / asynchronous action / thunk / intent: Use imperative mood:
 *  - fetchTenants, deleteTenant
 *  - fetchIcons, moveIcon
 *
 * Simple / synchronous action / fact: Use past tense:
 *  - fetchTenantsRequest, fetchTenantsSuccess, tenantDeleted
 *  - fetchIconsRequest, fetchIconsSuccess, iconMoved
 *  - dimensionsChanged, iconSizeChanged
 *  - itemDragged, connectionSelected, iconSelected, iconExpandToggled
 *  - editModeToggled, bodyOverlayToggled, writeTransactionToggled
 *
 */

import { fetchIcons, subscribeIcons } from './icons';
import { fetchConnections, subscribeConnections } from './connections';
import { fetchVnfs, subscribeVnfs } from './vnfs';
import { fetchDevices } from './devices';

import { fetchTenants } from './tenants';
import { fetchEndpoints } from './endpoints';
import { fetchNetworkServices } from './networkServices';


// === Thunk Middleware =======================================================

export const fetchTopologyData = () => async dispatch => {
  // Must fetch in order!
  await Promise.all([
    dispatch(fetchIcons()),
    dispatch(fetchVnfs())
  ]);
  dispatch(fetchConnections());
  dispatch(fetchDevices());
};

export const fetchSidebarData = () => dispatch => {
  dispatch(fetchTenants());
  dispatch(fetchEndpoints());
  dispatch(fetchNetworkServices());
};

export const fetchAll = () => dispatch => {
  dispatch(fetchTopologyData());
  dispatch(fetchSidebarData());
};

export const subscribeTopologyData = () => dispatch => {
  dispatch(subscribeIcons());
  dispatch(subscribeConnections());
  dispatch(subscribeVnfs());
};
