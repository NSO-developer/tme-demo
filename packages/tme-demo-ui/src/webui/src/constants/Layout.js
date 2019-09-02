import * as Colours from './Colours';

export const TITLE = 'TME Demo';

export const COMMIT_MANAGER_URL = '/webui-one/CommitManager';
export const CONFIGURATION_EDITOR_URL = '/webui-one/ConfigurationEditor';
export const DASHBOARD_URL = '/webui-one/Dashboard';
export const DEVICE_MANAGER_URL = '/webui-one/DeviceManager';
export const SERVICE_MANAGER_URL = '/webui-one/ServiceManager';
export const LOGIN_URL = '/login.html';

export const ICON_INITIAL_MAX_SIZE_PC = 10;
export const ICON_INITIAL_MAX_SIZE_PX = 64;
export const ICON_VNF_SPACING = 1.3;
export const ICON_VM_SPACING = 0.6;
export const CIRCLE_ICON_RATIO = 0.2;
export const LINE_ICON_RATIO = 0.1;

// Layout
export const DATA_CENTRE = 'data-centre';
export const PROVIDER = 'provider';
export const ACCESS = 'access';
export const CUSTOMER = 'customer';

export const LAYOUT = [
  { name: DATA_CENTRE, width: 30, title: 'Data Centre',
    connectionColour: Colours.SWITCH_STROKE, zoomed: [
    { title: 'Data Centre 1', width: 50 },
    { title: 'Data Centre 2', width: 50 } ] },
  { name: PROVIDER, width: 35, title: 'Transport' },
  { name: ACCESS, width: 15, title: 'Access' },
  { name: CUSTOMER, width: 20, title: 'Branch',
    connectionColour: Colours.CUSTOMER_ROUTER_STROKE }
];
