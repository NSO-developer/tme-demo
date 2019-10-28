const NSO_GREEN = 'rgb(20, 167,146)';
const NSO_BLUE = 'rgb(4, 159, 217)';
const NSO_BACKGROUND_GREY = 'rgb(245, 247, 250)';
const NSO_VERY_LIGHT_GREY = 'rgb(232, 235, 241)';
const NSO_BORDER_GREY = 'rgb(204, 204, 204)';
const NSO_LIGHT_GREY = 'rgb(182, 185, 187)';
const NSO_DARK_GREY = 'rgb(57, 57, 59)';


export const STROKE = NSO_BLUE;
export const SELECTED_CONNECTION = NSO_GREEN;
export const HIGHLIGHT = NSO_BLUE;
export const HOVER = NSO_GREEN;
export const LABEL_TEXT = NSO_DARK_GREY;
export const LABEL_BORDER = NSO_BORDER_GREY;
export const LABEL_BACKGROUND = 'rgba(255, 255, 255, 0.7)';

//Icon colours
export const ROUTER = '#36C6F4';
export const CUSTOMER_ROUTER = 'Tan';
export const CUSTOMER_ROUTER_STROKE = 'RosyBrown';
export const SWITCH = 'MediumTurquoise';
export const SWITCH_STROKE = 'CadetBlue';
export const SERVICE_CHAIN = 'MediumTurquoise';
export const FLAME = 'DarkOrange';
export const BACKGROUND = 'WhiteSmoke';
export const FIREWALL = ROUTER;
export const WEB_SERVER = 'MediumTurquoise';
export const LOAD_BALANCER = NSO_BLUE;
export const ANTENNA = 'Tan';
export const ANTENNA_STROKE = 'RosyBrown';
export const GENERIC = NSO_BLUE;

//State colour map
export const STATE_COLOURS = {
  'unreachable' : NSO_LIGHT_GREY,
  'reachable'   : undefined,
  'not-ready'   : 'DarkKhaki',
  'init'        : NSO_LIGHT_GREY,
  'deployed'    : 'DarkKhaki',
  'recovering'  : 'DarkKhaki',
  'ready'       : undefined,
  'error'       : 'IndianRed'
};
