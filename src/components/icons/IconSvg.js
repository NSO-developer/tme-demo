import React from 'react';
import * as Colours from '../../constants/Colours';
import * as Icons from '../../constants/Icons';

import Firewall from './Firewall';
import Router from './Router';
import ServiceChain from './ServiceChain';

export default function(props) {
  const { type, status, size } = props;
  switch (type) {
    case Icons.ROUTER:
      return (
        <Router
          colour={status === Icons.DISABLED ? Colours.DISABLED : Colours.ROUTER}
          size={size}
        />
      );
    case Icons.FIREWALL:
      return <Firewall size={size} />;
    case Icons.SERVICE_CHAIN:
      return <ServiceChain size={size} />;
    default:
      return <Router colour={Colours.ROUTER} size={size} />;
  }
}
