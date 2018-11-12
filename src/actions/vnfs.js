import JsonRpc from '../utils/JsonRpc';
import { handleError } from './uiState';

export const FETCH_VNFS_REQUEST = 'fetch-vnfs-request';
export const FETCH_VNFS_SUCCESS = 'fetch-vnfs-sccess';
export const FETCH_VNFS_FAILURE = 'fetch-vnfs-failure';


// === Thunk Middleware =======================================================

// Need to use a custom thunk here (rather than the generic jsonRpcQuery
// middleware) to process the VNF data.

export const fetchVnfs = () => async dispatch => {
  dispatch({ type: FETCH_VNFS_REQUEST });

  try {
    const nsInfos = await JsonRpc.query({
      context_node : '/nfvo/ns-info/esc',
      xpath_expr   : 'ns-info',
      selection    : ['id', 'tenant', 'deployment-name', 'esc', 'nsd', 'flavor']
    });

    const vnfsByNs = await Promise.all(nsInfos.results.map(async nsInfo => {
      const [ id, tenant, depName, esc, nsd, flavour ] = nsInfo;
      const vdus = await JsonRpc.query({
        xpath_expr :
          `/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc/vnf-deployment` +
          `[tenant='${tenant}'][deployment-name='${depName}'][esc='${esc}']` +
          `/vnf-info/vdu`,
        selection  : ['../name', 'id']
      });

      const vmDevices = await JsonRpc.query({
        xpath_expr :
          `/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc/vnf-deployment-result` +
          `[tenant='${tenant}'][deployment-name='${depName}'][esc='${esc}']` +
          `/vdu/vm-device`,
        selection  : [
          'vmid',
          '../vnf-info',
          '../vdu',
          'device-name',
          '../vms-scaling',
          'local-name(status/*)' ]
      });

      return await Promise.all(vdus.results.map(async vduItem => {
        const [ name, vdu ] = vduItem;

        const result = vmDevices.results.find(vmDevice =>
          vmDevice[1] === name && vmDevice[2] === vdu);

        const [ vmId, tmpName, tmpVdu, device, scaling, state ] =
          result ? result : [];

        const sapdConnectivities = await JsonRpc.query({
          xpath_expr :
            `/nfvo-rel2:nfvo/nsd[id='${nsd}']` +
            `/deployment-flavor[id='${flavour}']` +
            `/vnf-profile[id='${name}']/sapd-connectivity`,
          selection    : ['sapd']
        });

        return {
          id: `${id}-${name}`,
          name, vdu, vmId, device,
          state: state || 'init',
          displayName: `_${tenant}_${depName}_${vdu}`,
          nsInfoId: id,
          connectionPoints: sapdConnectivities.results.map(([sapd]) => sapd)
        };

      }));
    }));

    const vnfs = vnfsByNs.reduce((acc, vnfDep) => acc.concat(vnfDep), []);
    dispatch({
      type: FETCH_VNFS_SUCCESS,
      items: vnfs,
      receivedAt: Date.now()
    });

  } catch(exception) {
    dispatch(handleError('Failed to fetch ns-infos', exception));
  }

};

