import * as ActionTypes from '../actions/vnfs';
import jsonRpcWrapper, { getItems } from './jsonRpcWrapper';
import { createSelector } from 'reselect';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';

export const getVnfsByDevice = createSelector(getItems, vnfs => {
  console.debug('Reselect vnfsByDevice');
  return Object.keys(vnfs).reduce((acc, key) => {
    Object.keys(vnfs[key].vmDevices).forEach(device => {
      acc[device] = key; });
    return acc;
  }, {});
});

export const getNsInfoVnfs = (nsInfo, vnfs) => {
  console.debug(`Reselect nsInfo Vnfs ${nsInfo}`);

  const result = [];
  const vnfKeys = Object.keys(vnfs).filter(key => vnfs[key].nsInfo === nsInfo);
  vnfKeys.sort((a, b) => vnfs[a].virtualLinks.length -
                         vnfs[b].virtualLinks.length);
  vnfKeys.sort((a, b) => vnfs[a].sapds.length - vnfs[b].sapds.length);

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
    next(vnfKeys[0]);
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
  const { type, vnf, name, vmsScaling, vmId, status } = action;

  switch (type) {

    case ActionTypes.NS_DELETED:
      return Object.keys(state).reduce((accumulator, vnf) => {
        if (state[vnf].nsInfo !== name) {
          accumulator[vnf] = state[vnf];
        }
        return accumulator;
      }, {});

    case ActionTypes.VNF_SCALE_EVENT:
      return { ...state, [name]: { ...state[name],
        vmsScaling: vmsScaling > state[name].vmsScaling
          ? vmsScaling : state[name].vmsScaling} };

    case ActionTypes.VNF_VM_STATUS_UPDATED: {
      let device = undefined;
      const vnf = Object.keys(state).find(vnf => {
        device = Object.keys(state[vnf].vmDevices).find(
          device => state[vnf].vmDevices[device].vmId == vmId
        );
        return device;
      });

      if (vnf && device) {
        return { ...state,
          [vnf]: {
            ...state[vnf],
            vmDevices: {
              ...state[vnf].vmDevices,
              [device]: {
                ...state[vnf].vmDevices[device],
                status
              }
            }
          }
        };
      }
      return state;
    }

    case ActionTypes.VNF_VM_DEVICE_CREATED:
      return { ...state,
        [vnf]: {
          ...state[vnf],
          vmsScaling: state[vnf].vmsScaling == 0 ? 0 : state[vnf].vmsScaling - 1,
          vmDevices: {
            ...state[vnf].vmDevices,
            [name]: { vmId, status: 'init' }
          }
        }
      };

    case ActionTypes.VNF_VM_DEVICE_DELETED:
      return { ...state,
        [vnf]: {
          ...state[vnf],
          vmDevices: Object.keys(state[vnf].vmDevices).reduce(
            (accumulator, current) => {
              if (current !== name) {
                accumulator[current] = state[vnf].vmDevices[current];
              }
              return accumulator;
            }, {}
          )
        }
      };

    default:
      return state;
  }
});
