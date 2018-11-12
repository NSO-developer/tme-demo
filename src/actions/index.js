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

import { fetchIcons } from './icons';
import { fetchConnections } from './connections';
import { fetchVnfs } from './vnfs';

import { fetchTenants } from './tenants';
import { fetchEndpoints } from './endpoints';


// === Thunk Middleware =======================================================

export const fetchTopologyData = () => async dispatch => {
  // Must fetch in order!
  await dispatch(fetchIcons());
  await dispatch(fetchVnfs());
  dispatch(fetchConnections());
};

export const fetchSidebarData = () => dispatch => {
  dispatch(fetchTenants());
  dispatch(fetchEndpoints());
};

export const fetchAll = () => dispatch => {
  dispatch(fetchTopologyData());
  dispatch(fetchSidebarData());
};
