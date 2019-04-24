import * as ActionTypes from '../actions/vnfs';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';

export const getVnfsByDevice = createSelector(getItems, vnfs => {
  console.debug('Reselect vnfsByDevice');
  return Object.keys(vnfs).reduce((acc, key) => {
    Object.keys(vnfs[key].vmDevices).forEach(vmDeviceKey => {
      acc[vnfs[key].vmDevices[vmDeviceKey].device] = key; });
    return acc;
  }, {});
});

export const getNsInfoVnfs = (nsInfo, vnfs) => {
  console.debug(`Reselect nsInfo Vnfs ${nsInfo}`);

  const result = [];
  const vnfKeys = Object.keys(vnfs).filter(key => vnfs[key].nsInfo === nsInfo);

  const pushVnf = (vnf, linkToPrevious) => {
    if (vnfKeys.includes(vnf.name)) {
      let vmDevices = [];
      if (vnf.vmDevices && Object.keys(vnf.vmDevices).length > 0) {
        vmDevices = Object.keys(vnf.vmDevices).map(key => ({
          name: key, ...vnf.vmDevices[key]
        }));
      } else {
        vmDevices = [{ name: 'init', status: 'init' }];
      }

      for (let i = 0; i < vnf.vmsScaling; i++) {
        vmDevices.push({ name: `scale-out-${i}`, status: 'init' });
      }

      result.push({ ...vnf, linkToPrevious, vmDevices });
      vnfKeys.splice(vnfKeys.indexOf(vnf.name), 1);
      return true;
    } else {
      return false;
    }
  };

  const links = vnfKeys.reduce((accumulator, key) => {
    const vnf = vnfs[key];
    vnf.virtualLinks.forEach(link => {
      link in accumulator
        ? accumulator[link].push(vnf.name)
        : accumulator[link] = [ vnf.name ];
    });
    return accumulator;
  }, {});

  const sapds = vnfKeys.reduce((accumulator, key) => {
    const vnf = vnfs[key];
    vnf.sapds.forEach(sapd => {
      sapd === 'mgmt' ?
        accumulator[sapd] = [] :
          sapd in accumulator
            ? accumulator[sapd].push(vnf.name)
            : accumulator[sapd] = [ vnf.name ];
    });
    return accumulator;
  }, {});

  const followLink = (vnf, link) => {
    const nextVnf = links[link].find(nextVnf => nextVnf !== vnf);
    if (nextVnf) {
      console.debug(`Link: ${vnf} --[ ${link} ]--> ${nextVnf}`);
      next(nextVnf, link,);
    }
  };

  const followSapd = (vnf, sapd) => {
    const nextVnf = sapds[sapd].find(nextVnf => nextVnf !== vnf);
    if (nextVnf) {
      console.debug(`Sapd: ${vnf} --[ ${sapd} ]--> ${nextVnf}`);
      next(nextVnf, undefined, sapd);
    }
  };

  const next = (vnf, fromLink, fromSapd) => {
    if (pushVnf(vnfs[vnf], !!(fromLink || fromSapd))) {
      console.debug(`Added: ${vnf}`);
      vnfs[vnf].virtualLinks.forEach(nextLink => {
        if (!fromLink || nextLink !== fromLink) {
          followLink(vnf, nextLink);
        }
      });
      vnfs[vnf].sapds.forEach(nextSapd => {
        if (!fromSapd || nextSapd !== fromSapd) {
          followSapd(vnf, nextSapd);
        }
      });
    } else {
      console.debug(`Skipped: ${vnf}`);
    }
  };

  while (vnfKeys.length > 0) {
    let first = vnfKeys.find(key => vnfs[key].virtualLinks.length === 0 &&
                             vnfs[key].sapds.length > 0);

    if (!first) {
      first = vnfKeys.find(key => vnfs[key].virtualLinks.length === 1);
    }

    if (!first) {
      first = vnfKeys[0];
    }

    next(first);
  }
  return result;
};


// === Reducer ================================================================

export default jsonRpcWrapper([
  ActionTypes.FETCH_VNFS_REQUEST,
  ActionTypes.FETCH_VNFS_SUCCESS,
  ActionTypes.FETCH_VNFS_FAILURE,
  ActionTypes.VNF_DELETED,
  ActionTypes.VNF_ADDED
],
(state = [], action) => {
  const { type, name, vmsScaling, vmId, status, device } = action;

  switch (type) {

    case ActionTypes.NS_DELETED:
      return Object.keys(state).reduce((accumulator, vnf) => {
        if (state[vnf].nsInfo !== name) {
          accumulator[vnf] = state[vnf];
        }
        return accumulator;
      }, {});

    case ActionTypes.VNF_SCALE_EVENT:
      return { ...state, [name]: { ...state[name], vmsScaling } };

    case ActionTypes.VNF_VM_STATUS_UPDATED:
      return { ...state,
        [name]: {
          ...state[name],
          vmDevices: {
            ...state[name].vmDevices,
            [vmId]: {
              ...state[name].vmDevices[vmId],
              status
            }
          }
        }
      };

    case ActionTypes.VNF_VM_DEVICE_UPDATED:
      return { ...state,
        [name]: {
          ...state[name],
          vmDevices: {
            ...state[name].vmDevices,
            [vmId]: {
              ...state[name].vmDevices[vmId],
              device
            }
          }
        }
      };

    default:
      return state;
  }
});
