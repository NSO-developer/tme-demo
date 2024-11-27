import React from 'react';
import * as Colours from '../../constants/Colours';
import * as Icons from '../../constants/Icons';

import Firewall from './Firewall';
import Router from './Router';
import Switch from './Switch';
import ServiceChain from './ServiceChain';
import LoadBalancer from './LoadBalancer';
import WebServer from './WebServer';
import Antenna from './Antenna';
import Generic from './Generic';

export default function(props) {
  const { type, status, size } = props;
  const colour = Colours.STATE_COLOURS[status];
  switch (type) {
    case Icons.ROUTER:
      return <Router colour={colour}
                     baseColour={Colours.ROUTER}
                     strokeColour={Colours.STROKE}
                     size={size} />;
    case Icons.CUSTOMER_ROUTER:
      return <Router colour={colour}
                     baseColour={Colours.CUSTOMER_ROUTER}
                     strokeColour={Colours.CUSTOMER_ROUTER_STROKE}
                     size={size} />;
    case Icons.SWITCH:
      return <Switch colour={colour} size={size} />;
    case Icons.FIREWALL:
      return <Firewall colour={colour} size={size} />;
    case Icons.SERVICE_CHAIN:
      return <ServiceChain colour={colour} size={size} />;
    case Icons.LOAD_BALANCER:
      return <LoadBalancer colour={colour} size={size} />;
    case Icons.WEB_SERVER:
      return <WebServer colour={colour} size={size} />;
    case Icons.ANTENNA:
      return <Antenna colour={colour} size={size} />;
    default:
      return <Generic colour={colour} size={size} />;
  }
}
