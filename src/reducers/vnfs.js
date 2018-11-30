import * as ActionTypes from '../actions/vnfs';
import jsonRpcWrapper from './jsonRpcWrapper';


// === Selectors ==============================================================

export { getItems, getIsFetching } from './jsonRpcWrapper';

export const getNsInfoVnfs = (nsInfo, vnfs) => {
  console.debug(`Reselect nsInfo Vnfs ${nsInfo}`);

  const result = [];
  const vnfKeys = Object.keys(vnfs).filter(key => vnfs[key].nsInfo === nsInfo);

  const pushVnf = (vnf, linkToPrevious) => {
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
    vnfKeys.splice(vnfKeys.find(key => key === vnf.name), 1);
  };

  const links = vnfKeys.reduce((accumulator, key) => {
    const vnf = vnfs[key];
    vnf.virtualLinks.forEach(link => {
      accumulator[link]
        ? accumulator[link].push(vnf.name)
        : accumulator[link] = [ vnf.name ];
    });
    return accumulator;
  }, {});

  const followLink = (vnf, link) => {
    const nextVnf = links[link].find(nextVnf => nextVnf !== vnf);
    if (nextVnf) {
      pushVnf(vnfs[nextVnf], true);
      vnfs[nextVnf].virtualLinks.forEach(nextLink => {
        if (nextLink !== link) {
          followLink(nextVnf, nextLink);
        }
      });
    }
  };

  while (vnfKeys.length > 0) {
    let first = vnfKeys.find(key => vnfs[key].virtualLinks.length === 1
      && vnfs[key].sapds.length <= 1);

    if (!first) {
      first = vnfKeys.find(key => vnfs[key].virtualLinks.length === 1);
    }

    if (!first) {
      first = vnfKeys[0];
    }

    pushVnf(vnfs[first], false);
    vnfs[first].virtualLinks.forEach(link => {
      followLink(first, link);
    });
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
  const { type, name, vmsScaling, vmId, status } = action;

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

    default:
      return state;
  }
});
