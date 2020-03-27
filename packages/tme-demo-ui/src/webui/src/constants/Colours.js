import { getCssVariable } from '../utils/UiUtils';

const PRIMARY = getCssVariable('primary');
const SECONDARY = getCssVariable('secondary');
const BORDER = getCssVariable('border');
const DISABLED = getCssVariable('disabled');
const HEADER = getCssVariable('header');
const BLUE = 'rgb(4, 159, 217)';

export const SELECTED_CONNECTION = SECONDARY;
export const HIGHLIGHT = PRIMARY;
export const HOVER = SECONDARY;
export const LABEL_TEXT = HEADER;
export const LABEL_BORDER = BORDER;
export const LABEL_BACKGROUND = 'rgba(255, 255, 255, 0.7)';

//Icon colours
export const ROUTER = '#36C6F4';
export const STROKE = BLUE;
export const CUSTOMER_ROUTER = 'Tan';
export const CUSTOMER_ROUTER_STROKE = 'RosyBrown';
export const SWITCH = 'MediumTurquoise';
export const SWITCH_STROKE = 'CadetBlue';
export const SERVICE_CHAIN = 'MediumTurquoise';
export const FLAME = 'DarkOrange';
export const BACKGROUND = 'WhiteSmoke';
export const FIREWALL = ROUTER;
export const WEB_SERVER = 'MediumTurquoise';
export const LOAD_BALANCER = BLUE;
export const ANTENNA = 'Tan';
export const ANTENNA_STROKE = 'RosyBrown';
export const GENERIC = BLUE;

//State colour map
export const STATE_COLOURS = {
  'unreachable'             : DISABLED,
  'reachable'               : undefined,
  'not-ready'               : 'DarkKhaki',
  'init'                    : DISABLED,
  'deployed'                : 'DarkKhaki',
  'device-created'          : 'DarkKhaki',
  'alive'                   : 'Khaki',
  'fetch-host-keys'         : 'Khaki',
  'sync'                    : 'LightGreen',
  'apply-device-templates'  : 'LightGreen',
  'recovering'              : 'DarkKhaki',
  'ready'                   : undefined,
  'error'                   : 'IndianRed'
};
