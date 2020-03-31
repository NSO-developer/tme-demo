import { ICON_NAME_TO_TYPE, GENERIC } from '../constants/Icons';
import JsonRpc from '../utils/JsonRpc';
import Comet from '../utils/Comet';
import { handleError } from './uiState';
import { startSubscriptionRequest, startSubscriptionSuccess, subscriptionEvent,
         START_SUBSCRIPTION_FAILURE } from './comet';

export const VNF_VM_STATUS_UPDATED = 'vnf-vm-status-updated';
export const VNF_VM_DEVICE_CREATED = 'vnf-vm-device-created';
export const VNF_VM_DEVICE_DELETED = 'vnf-vm-device-deleted';
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

export const vnfVmStatusUpdated = (vmId, status) => ({
  type: VNF_VM_STATUS_UPDATED, vmId, status
});

export const vnfVmDeviceCreated = (vnf, name, vmId) => ({
  type: VNF_VM_DEVICE_CREATED, vnf, name, vmId
});

export const vnfVmDeviceDeleted = (vnf, name) => ({
  type: VNF_VM_DEVICE_DELETED, vnf, name
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

const extractState = state => state.substr(state.indexOf(':') + 1);

const getNsdSapds = async (nsd) => {
  const sapds = await JsonRpc.query({
    path       : `/nfv:nfv/nsd{'${nsd}'}/sapd`,
    selection  : [ 'id', 'virtual-link-desc' ]
  });
  const res = sapds.results.reduce(
    (accumulator, [sapd, vld]) => {
      accumulator[sapd] = vld;
      return accumulator;
    }, {});
  return res;
};

const getNsdVirtualLinkProfiles = async (nsd, flavour) => {
  const virtualLinks = await JsonRpc.query({
    path      : `/nfv:nfv/nsd{'${nsd}'}/df{'${flavour}'}` +
                `/virtual-link-profile`,
    selection : [ 'id', 'virtual-link-desc-id' ]
  });
  return virtualLinks.results.reduce(
    (accumulator, [virtualLink, vld]) => {
      accumulator[virtualLink] = vld;
      return accumulator;
    }, {});
};

const getVirtualLinks = async (nsd, flavour, vnfInfo) => {
  const virtualLinks = await JsonRpc.getListKeys({
    path: `/nfv:nfv/nsd{'${nsd}'}/df{'${flavour}'}` +
          `/vnf-profile{'${vnfInfo}'}/virtual-link-connectivity`
  });
  const res = virtualLinks.keys.map(([virtualLink]) => virtualLink);
  return res;
};

const getVmsScaling = async (deploymentId, vmGroupName) => {
  let vmsScaling = 0;
  const path =  `/nfv:nfv/cisco-nfvo:internal` +
                `/netconf-deployment-result{'${deploymentId}'}` +
                `/vm-group{'${vmGroupName}'}/tme-demo:vms-scaling`;

  if (await JsonRpc.exists(path)) {
    vmsScaling = await JsonRpc.getValue(path);
  }

  return vmsScaling;
};

const getVmDevices = async (deploymentId, vmGroupName) => {
  const vmDevices = await JsonRpc.query({
    xpath_expr : `/nfv:nfv/cisco-nfvo:internal` +
                 `/netconf-deployment-result[id='${deploymentId}']` +
                 `/vm-group[name='${vmGroupName}']/vm-device`,
    selection  : [ 'name', 'device-name' ]
  });

  const vmDeviceStates = await Promise.all(vmDevices.results.map(
    async ([ vmId, device ]) => {
      const vmDevicePlan = await JsonRpc.query({
        xpath_expr : `/nfv:nfv/cisco-nfvo:internal` +
                     `/netconf-deployment-plan[id='${deploymentId}']` +
                     `/plan/component[` +
                        `type='cisco-nfvo-nano-services:vm-device' or ` +
                        `type='cisco-nfvo-nano-services:unmanaged-vm-device']` +
                     `[name='${vmId}']/state`,
        selection  : [ 'name', 'status' ]
      });

      return vmDevicePlan.results.reduce((accumulator, [ state, status ]) => {
        if (status == 'reached') {
          accumulator = extractState(state);
        }
        return accumulator;
      }, 'init');
    }
  ));

  return vmDevices.results.reduce((accumulator, [ vmId, device ], index) => {
    accumulator[device] = { vmId, status: vmDeviceStates[index] };
    return accumulator;
  }, {});
};

const getIconType = name => {
  const key = Object.keys(ICON_NAME_TO_TYPE).find(m => name.includes(m));
  return key ? ICON_NAME_TO_TYPE[key] : GENERIC;
};

const getVnfVdu =
  async (nsInfo, tenant, nsd, flavour, vnfInfo, vnfm, vdu) => {
    const deploymentId = `${vnfm}-ns-info-${nsInfo}`;
    const vmGroupName = `${vnfInfo}-${vdu}`;
    const nsdSapds = await getNsdSapds(nsd);
    const nsdVirtualLinkProfiles = await getNsdVirtualLinkProfiles(nsd, flavour);
    const virtualLinks = await getVirtualLinks(nsd, flavour, vnfInfo);

    const sapds = Object.keys(nsdSapds).reduce((accumulator, sapdKey) => {
      const vlp = Object.keys(nsdVirtualLinkProfiles).find(vlpKey =>
        nsdSapds[sapdKey] == nsdVirtualLinkProfiles[vlpKey]
      );
      if (virtualLinks.includes(vlp)) {
        accumulator.push(sapdKey);
        virtualLinks.splice(virtualLinks.indexOf(vlp), 1);
      }
      return accumulator;
    }, []);

    return {
      name: `${deploymentId}-${vmGroupName}`,
      deploymentId, nsInfo, vnfInfo, vdu, sapds, virtualLinks,
      type: getIconType(vnfInfo),
      vmsScaling: await getVmsScaling(deploymentId, vmGroupName),
      vmDevices: await getVmDevices(deploymentId, vmGroupName)
    };
};

export const fetchVnfs = () => async dispatch => {
  dispatch({ type: FETCH_VNFS_REQUEST });

  try {
    const nsInfos = await JsonRpc.query({
      context_node : '/nfv:nfv',
      xpath_expr   : 'ns-info',
      selection    : ['name', 'tenant', 'nsd', 'flavour']
    });

    const vnfsByNs = await Promise.all(
      nsInfos.results.map(async nsInfoResult => {
        const [ nsInfo, tenant, nsd, flavour ] = nsInfoResult;
        const vdus = await JsonRpc.query({
          context_node : `/nfv:nfv/ns-info{'${nsInfo}'}`,
          xpath_expr   : `vnf-info/vdu`,
          selection    : ['../vnf-profile', '../vnfm', 'id']
        });

        return await Promise.all(vdus.results.map(
          async ([ vnfInfo, vnfm, vdu ]) =>
            getVnfVdu(nsInfo, tenant, nsd, flavour, vnfInfo, vnfm, vdu)
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
  (nsInfo, vnfInfo, vdu ) => async dispatch => {

  const nsInfoPath = `/nfv:nfv/cisco-nfvo:ns-info{'${nsInfo}'}`;

  dispatch({ type: FETCH_ONE_VNF_REQUEST, nsInfo, vnfInfo, vdu });
  try {
    const nsInfoResult = await JsonRpc.getValues({
      path:  nsInfoPath,
      leafs: ['tenant', 'nsd', 'flavour']
    });

    const vnfInfoResult = await JsonRpc.getValues({
      path:  `${nsInfoPath}/vnf-info{${vnfInfo}}`,
      leafs: ['vnfm']
    });

    const tenant = nsInfoResult.values[0].value;
    const nsd = nsInfoResult.values[1].value;
    const flavour = nsInfoResult.values[2].value;
    const vnfm = vnfInfoResult.values[0].value;

    const vnf =
      await getVnfVdu(nsInfo, tenant, nsd, flavour, vnfInfo, vnfm, vdu);

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

const stripQuotes = value => {
  const match = /^"([^"]*)"$/.exec(value);
  return match ? match[1] : value;
};

const reExec = (regex, string) => {
  const match = regex.exec(string);
  return match ? match.map(value => stripQuotes(value)) : match;
};

const key = '("[^}"]+"|[^} ]+)';

const nsInfoPath = `/nfv:nfv/cisco-nfvo:ns-info{${key}}`;
const vnfVduPath = `${nsInfoPath}/vnf-info{${key}}/vdu{${key}}`;
const nsInfoRegex = new RegExp(`${nsInfoPath}?$`);
const vnfVduRegex = new RegExp(`${vnfVduPath}?$`);

const deploymentResultPath = `/nfv:nfv/cisco-nfvo:internal/netconf-deployment-result{${key}}`;
const vmGroupPath = `${deploymentResultPath}/vm-group{${key}}`;
const vmDevicePath = `${vmGroupPath}/vm-device{${key}}`;
const vmDeviceRegex = new RegExp(`${vmDevicePath}$`);
const vmDeviceNameRegex = new RegExp(`${vmDevicePath}/name$`);
const vmsScalingRegex = new RegExp(`${vmGroupPath}/tme-demo:vms-scaling$`);

const deploymentPlanPath = `/nfv:nfv/cisco-nfvo:internal/netconf-deployment-plan{${key}}/plan`;
const vmDevicePlanPath = `${deploymentPlanPath}/component{cisco-nfvo-nano-services:(unmanaged-)?vm-device ${key}}`;
const vmDeviceStatusRegex = new RegExp(`${vmDevicePlanPath}/state{${key}}/status$`);


export const subscribeVnfs = () => dispatch => {
  let path = '/nfv:nfv/cisco-nfvo:ns-info';
  let cdbOper = false;
  let skipLocal = false;

  dispatch(startSubscriptionRequest(path, cdbOper, skipLocal));

  try {
    Comet.subscribe({
      path, cdbOper, skipLocal,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op } = change;

          let match = reExec(vnfVduRegex, keypath);
          if (match) {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, nsInfo, vnfInfo, vdu ] = match;

            if (match && op === 'created') {
              dispatch(fetchOneVnf(nsInfo, vnfInfo, vdu));
            } else if (match && op === 'deleted') {
              dispatch(vnfDeleted(vnfInfo));
            }
          }

          match = reExec(nsInfoRegex, keypath);
          if (match && op === 'deleted') {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, nsInfo ] = match;
            dispatch(nsDeleted(nsInfo));
          }
        });
      }
    });
    dispatch(startSubscriptionSuccess(path, cdbOper, skipLocal));

    path = '/nfv:nfv/cisco-nfvo:internal/netconf-deployment-plan/plan/component/state/status';
    cdbOper = true;

    dispatch(startSubscriptionRequest(path, cdbOper));

    Comet.subscribe({
      path, cdbOper,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op, value } = change;

          const match = reExec(vmDeviceStatusRegex, keypath);
          if (match && op !== 'deleted' && value == 'reached') {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, deploymentId, managed, vmId, status ] = match;
            dispatch(vnfVmStatusUpdated(vmId, extractState(status)));
          }
        });
      }
    });
    dispatch(startSubscriptionSuccess(path, cdbOper));

    path = '/nfv:nfv/cisco-nfvo:internal/netconf-deployment-result/vm-group/vm-device';
    cdbOper = true;

    dispatch(startSubscriptionRequest(path, cdbOper));

    Comet.subscribe({
      path, cdbOper,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op, value } = change;

          let match = reExec(vmDeviceRegex, keypath);
          if (match && op == 'deleted') {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, deploymentId, vmGroupName, deviceName ] = match;
            const vnfName = `${deploymentId}-${vmGroupName}`;
            dispatch(vnfVmDeviceDeleted(vnfName, deviceName));
          }

          match = reExec(vmDeviceNameRegex, keypath);
          if (match && op !== 'deleted') {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, deploymentId, vmGroupName, deviceName ] = match;
            const vnfName = `${deploymentId}-${vmGroupName}`;
            dispatch(vnfVmDeviceCreated(vnfName, deviceName, value));
          }
        });
      }
    });
    dispatch(startSubscriptionSuccess(path, cdbOper));

    path = '/nfv:nfv/cisco-nfvo:internal/netconf-deployment-result/vm-group/vms-scaling';
    cdbOper = true;

    dispatch(startSubscriptionRequest(path, cdbOper));

    Comet.subscribe({
      path, cdbOper,
      callback : evt => {
        evt.changes.forEach(change => {
          const { keypath, op, value } = change;

          const match = reExec(vmsScalingRegex, keypath);
          if (match) {
            dispatch(subscriptionEvent(keypath, op));
            const [ all, deploymentId, vmGroupName ] = match;
            const vnfName = `${deploymentId}-${vmGroupName}`;
            const vmsScaling = value;
            dispatch(vnfScaleEvent(vnfName, vmsScaling));
          }
        });
      }
    });
    dispatch(startSubscriptionSuccess(path, cdbOper, skipLocal));

  } catch(exception) {
    dispatch(handleError(`Failed to subscribe to ${path}`,
      exception, START_SUBSCRIPTION_FAILURE));
  }
};
