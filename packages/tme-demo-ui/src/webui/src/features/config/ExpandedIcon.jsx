import './config.css';
import React from 'react';
import { memo  } from 'react';
import { useSelector } from 'react-redux';

import Config from './Config';

import { usePlatformsQuery, useIcon } from 'features/topology/Icon';
import { useNsInfoVnfs } from 'features/topology/Vnf';
import { getOpenServiceName } from 'features/menu/menuSlice';


const ExpandedIcon = memo(function ExpandedIcon({ name }) {
  console.debug('Expanded Icon Render');
  const icon = useIcon(name);
  if (!icon) {
    console.error(`Missing icon ${name}`);
  }
  const { device, nsInfo } = icon ||{} ;
  const vnfs = useNsInfoVnfs(nsInfo);
  const openService = useSelector((state) => getOpenServiceName(state));
  const platforms = usePlatformsQuery().data;

  const devices = device ? [ device ] : vnfs.flatMap(vnf => vnf.vmDevices.map(vm => vm.name));

  return (
    devices.filter(device =>
      platforms.find(({ parentName }) => parentName === device)).map(device =>
        <Config
          key={device}
          device={device}
          keypath={`/ncs:devices/device{${device}}`}
          managed={true}
          openService={openService} />
      )
  );
});

export default ExpandedIcon;
