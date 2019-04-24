import React from 'react';
import * as Colours from '../../constants/Colours';
import * as Icons from '../../constants/Icons';

import Firewall from './Firewall';
import Router from './Router';
import ServiceChain from './ServiceChain';
import LoadBalancer from './LoadBalancer';
import WebServer from './WebServer';
import Generic from './Generic';

export default function(props) {
  const { type, status, size } = props;
  const colour = Colours.STATE_COLOURS[status];
  switch (type) {
    case Icons.ROUTER:
      return <Router colour={colour} size={size} />;
    case Icons.FIREWALL:
      return <Firewall colour={colour} size={size} />;
    case Icons.SERVICE_CHAIN:
      return <ServiceChain colour={colour} size={size} />;
    case Icons.LOAD_BALANCER:
      return <LoadBalancer colour={colour} size={size} />;
    case Icons.WEB_SERVER:
      return <WebServer colour={colour} size={size} />;
    default:
      return <Generic colour={colour} size={size} />;
  }
}
