import { ICON_NAME_TO_TYPE, GENERIC } from '../constants/Icons';
import JsonRpc from '../utils/JsonRpc';
import Comet from '../utils/Comet';
import { handleError } from './uiState';
import { subscriptionRequest, subscriptionSuccess, subscriptionEvent,
         SUBSCRIPTION_FAILURE } from './comet';

export const VNF_VM_STATUS_UPDATED = 'vnf-vm-status-updated';
export const VNF_SCALE_EVENT = 'vnf-scale-event';
export const VNF_ADDED = 'vnf-added';
export const VNF_DELETED = 'vnf-deleted';
export const NS_DELETED = 'ns-deleted';

export const FETCH_VNFS_REQUEST = 'fetch-vnfs-request';
export const FETCH_VNFS_SUCCESS = 'fetch-vnfs-success';
export const FETCH_VNFS_FAILURE = 'fetch-vnfs-failure';

export const FETCH_ONE_VNF_REQUEST = 'fetch-one-vnf-request';
export const FETCH_ONE_VNF_FAILURE = 'fetch-one-vnf-failure';


// === Action Creators ========================================================

export const vnfVmStatusUpdated = (name, vmId, status) => ({
  type: VNF_VM_STATUS_UPDATED, name, vmId, status
});

export const vnfScaleEvent = (name, vmsScaling) => ({
  type: VNF_SCALE_EVENT, name, vmsScaling
});

export const vnfDeleted = name => ({
  type: VNF_DELETED, name
});

export const nsDeleted = name => ({
  type: NS_DELETED, name
});


// === Thunk Middleware =======================================================

// Need to use a custom thunks here (rather than the generic jsonRpcMiddleware)
// to process the VNF data.

const getSapds = async (nsd, flavour, vnfInfo) => {
  const sapds = await JsonRpc.getListKeys({
    path: `/nfvo-rel2:nfvo/nsd{'${nsd}'}` +
          `/deployment-flavor{'${flavour}'}` +
          `/vnf-profile{'${vnfInfo}'}/sapd-connectivity`
  });
  const res = sapds.keys.map(([sapd]) => sapd);
  return res;
};

const getVirtualLinks = async (nsd, flavour, vnfInfo) => {
  const virtualLinks = await JsonRpc.getListKeys({
    path: `/nfvo-rel2:nfvo/nsd{'${nsd}'}` +
          `/deployment-flavor{'${flavour}'}` +
          `/vnf-profile{'${vnfInfo}'}/virtual-link-connectivity`
  });
  const res = virtualLinks.keys.map(([virtualLink]) => virtualLink);
  return res;
};

const getVmsScaling = async (tenant, depName, esc, vnfInfo, vdu) => {
  let vmsScaling = 0;
  const path =  `/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc` +
                `/vnf-deployment-result{'${tenant}' '${depName}' '${esc}'}` +
                `/vdu{'${vnfInfo}' '${vdu}'}/vms-scaling`;

  if (await JsonRpc.exists(path)) {
    vmsScaling = await JsonRpc.getValue(path);
  }

  return vmsScaling;
};

const getVmDevices = async (tenant, depName, esc, vnfInfo, vdu) => {
  const vmDevices = await JsonRpc.query({
    xpath_expr : `/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc` +
                 `/vnf-deployment-result[tenant='${tenant}']` +
                 `[deployment-name='${depName}'][esc='${esc}']` +
                 `/vdu[vnf-info='${vnfInfo}'][vdu='${vdu}']/vm-device`,
    selection  : [ 'vmid', 'device-name', 'local-name(status/*)' ]
  });

  return vmDevices.results.reduce((acc, [ vmId, device, status ]) => {
    acc[vmId] = { device, status: status || 'init' };
    return acc;
  }, {});
};

const getIconType = name => {
  const key = Object.keys(ICON_NAME_TO_TYPE).find(m => name.includes(m));
  return key ? ICON_NAME_TO_TYPE[key] : GENERIC;
};

const getVnfVduName = (nsInfo, vnfInfo, vdu) => {
  return `${nsInfo}-${vnfInfo}-${vdu}`;
};

const getVnfVdu =
  async (nsInfo, vnfInfo, vdu, nsd, flavour, tenant, depName, esc) => ({
    name: getVnfVduName(nsInfo, vnfInfo, vdu),
    nsInfo, vnfInfo, vdu,
    type: getIconType(vnfInfo),
    sapds: await getSapds(nsd, flavour, vnfInfo),
    virtualLinks: await getVirtualLinks(nsd, flavour, vnfInfo),
    vmsScaling: await getVmsScaling(tenant, depName, esc, vnfInfo, vdu),
    vmDevices: await getVmDevices(tenant, depName, esc, vnfInfo, vdu)
});

export const fetchVnfs = () => async dispatch => {
  dispatch({ type: FETCH_VNFS_REQUEST });

  try {
    const nsInfos = await JsonRpc.query({
      context_node : '/nfvo/ns-info/esc',
      xpath_expr   : 'ns-info',
      selection    : ['id', 'tenant', 'deployment-name', 'esc', 'nsd', 'flavor']
    });

    const vnfsByNs = await Promise.all(
      nsInfos.results.map(async nsInfoResult => {
        const [ nsInfo, tenant, depName, esc, nsd, flavour ] = nsInfoResult;
        const vdus = await JsonRpc.query({
          context_node : `/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc` +
                         `/vnf-deployment{'${tenant}' '${depName}' '${esc}'}`,
          xpath_expr   : `vnf-info/vdu`,
          selection    : ['../name', 'id']
        });

        return await Promise.all(vdus.results.map(async ([ vnfInfo, vdu ]) =>
          getVnfVdu(nsInfo, vnfInfo, vdu, nsd, flavour, tenant, depName, esc)
        ));
    }));

    const vnfs = vnfsByNs.reduce((accumulator, vnfs) => {
      vnfs.forEach(vnf => accumulator[vnf.name] = vnf);
      return accumulator;
    }, {});

    dispatch({
      type: FETCH_VNFS_SUCCESS,
      items: vnfs,
      receivedAt: Date.now()
    });

  } catch(exception) {
    dispatch(handleError('Failed to fetch vnf-infos',
      exception, FETCH_VNFS_FAILURE));
  }
};

export const fetchOneVnf =
  (tenant, depName, esc, nsInfo, vnfInfo, vdu ) => async dispatch => {

  dispatch({ type: FETCH_ONE_VNF_REQUEST,
             tenant, depName, esc, nsInfo, vnfInfo, vdu });
  try {
    const nsInfoResult = await JsonRpc.getValues({
      path:  `/nfvo-rel2:nfvo/ns-info/nfvo-rel2-esc:esc/ns-info{'${nsInfo}'}`,
      leafs: ['nsd', 'flavor']
    });

    const nsd = nsInfoResult.values[0].value;
    const flavour = nsInfoResult.values[1].value;

    const vnf =
      await getVnfVdu(nsInfo, vnfInfo, vdu, nsd, flavour, tenant, depName, esc);

    dispatch({
      type: VNF_ADDED,
      name: vnf.name,
      item: vnf,
      receivedAt: Date.now()
    });

  } catch(exception) {
    dispatch(handleError('Failed to fetch vnf-info',
      exception, FETCH_ONE_VNF_FAILURE));
  }
};


// === Thunk Middleware (Comet subscriptions) =================================

const parseMatch = match => {
  const [ all, tenant, depName, esc, vnfInfo, vdu ] = match;
  const nsInfo = `${tenant}_${depName}`;
  const vnfVduName = getVnfVduName(nsInfo, vnfInfo, vdu);

  return { nsInfo, vnfVduName, tenant, depName, esc, vnfInfo, vdu };
};

export const subscribeVnfs = () => dispatch => {
  let path = '/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc/vnf-deployment';
  let cdbOper = false;

  dispatch(subscriptionRequest(path, cdbOper));

  try {
    Comet.subscribe({
      path, cdbOper, skipLocalChanges: false,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op } = change;
          const match = /\/nfvo-rel2:nfvo\/vnf-info\/nfvo-rel2-esc:esc\/vnf-deployment\{([^{} ]+) ([^{} ]+) ([^{} ]+)\}(?:\/vnf-info\{([^{} ]+)\}(?:\/vdu\{([^{} ]+)\}))?$/.exec(keypath);

          if (match) {
            dispatch(subscriptionEvent(keypath, op));
            const { tenant, depName, esc, vnfInfo, vdu,
                    nsInfo, vnfVduName } = parseMatch(match);

            if (match && op === 'created' && vdu) {
              dispatch(fetchOneVnf(tenant, depName, esc, nsInfo, vnfInfo, vdu));
            } else if (match && op === 'deleted' && vdu) {
              dispatch(vnfDeleted(vnfVduName));
            } else if (match && op === 'deleted') {
              dispatch(nsDeleted(nsInfo));
            }
          }
        });
      }
    });
    dispatch(subscriptionSuccess(path, cdbOper));

    path = '/nfvo-rel2:nfvo/vnf-info/nfvo-rel2-esc:esc/vnf-deployment-result';
    cdbOper = true;

    dispatch(subscriptionRequest(path, cdbOper));

    Comet.subscribe({
      path, cdbOper, skipLocalChanges: false,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op, value } = change;

          let match = /\/nfvo-rel2:nfvo\/vnf-info\/nfvo-rel2-esc:esc\/vnf-deployment-result\{([^{} ]+) ([^{} ]+) ([^{} ]+)\}\/vdu\{([^{} ]+) ([^{} ]+)\}\/vm-device\{([^{} ]+) ([^{} ]+)\}\/status\/([^{} ]+)$/.exec(keypath);
          if (match && op !== 'deleted') {
            dispatch(subscriptionEvent(keypath, op));
            const { vnfVduName } = parseMatch(match);
            const vmId = match[7];
            const status = match[8];
            dispatch(vnfVmStatusUpdated(vnfVduName, vmId, status));
          }

          match = /\/nfvo-rel2:nfvo\/vnf-info\/nfvo-rel2-esc:esc\/vnf-deployment-result\{([^{} ]+) ([^{} ]+) ([^{} ]+)\}\/vdu\{([^{} ]+) ([^{} ]+)\}\/l3vpn:vms-scaling\/([^{} ]+)$/.exec(keypath);
          if (match) {
            dispatch(subscriptionEvent(keypath, op));
            const { vnfVduName } = parseMatch(match);
            const vmsScaling = value;
            dispatch(vnfScaleEvent(vnfVduName, vmsScaling));
          }
        });
      }
    });
    dispatch(subscriptionSuccess(path, cdbOper));

  } catch(exception) {
    dispatch(handleError(`Failed to subscribe to ${path}`,
      exception, SUBSCRIPTION_FAILURE));
  }
};
