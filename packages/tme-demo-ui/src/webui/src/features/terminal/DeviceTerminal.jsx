import React from 'react';
import Terminal from './Terminal';
import { usePlatform, useAuthgroup } from '../topology/Icon';


function DeviceTerminal({ device, active }) {
  console.debug('Device Terminal Render');
  const output = '';

  const { address, port, authgroup } = usePlatform(device);
  const { defaultMapRemoteName } = useAuthgroup(authgroup);

  return (address ?
    <Terminal
      ip={address}
      port={port}
      username={defaultMapRemoteName}
      password={defaultMapRemoteName}
      keypath={undefined}
      active={active}
      history={output}
    /> : active ?
    <div className="terminal">
      <pre className="terminal__telnet">{output}</pre>
    </div> : null
  );
}

export default DeviceTerminal;
