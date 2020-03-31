import { fetchDeviceList } from './index';

export const FETCH_DEVICES_REQUEST = 'fetch-devices-request';
export const FETCH_DEVICES_SUCCESS = 'fetch-devices-success';
export const FETCH_DEVICES_FAILURE = 'fetch-devices-failure';


// === JsonRpc Middleware =====================================================

const path = '/ncs:devices/device/platform';
const selection = [ '../name', 'name', 'model', 'version' ];
const resultKeys = [ 'name', 'platform', 'model', 'version' ];

export const fetchDevices = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : selection,
    resultKeys  : resultKeys,
    objectKey   : 'name'
  },
  types: [
    FETCH_DEVICES_REQUEST,
    FETCH_DEVICES_SUCCESS,
    FETCH_DEVICES_FAILURE
  ],
  errorMessage: 'Failed to fetch devices'
});

// === Comet Middleware =======================================================

export const subscribeDevices = () => ({
  subscribe: {
    path: '/ncs:devices/device',
    cdbOper: false,
    hideChanges: true
  },
  actions: [ fetchDeviceList ]
});
