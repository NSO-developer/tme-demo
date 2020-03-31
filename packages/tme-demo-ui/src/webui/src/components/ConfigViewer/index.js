import './index.css';
import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../Sidebar';
import Config from './Config';
import { getExpandedIcons, getIcons, getVnfs, getDevices,
         getConfigViewerVisible, getOpenTenant } from '../../reducers';

const mapStateToProps = state => ({
  expandedIcons: getExpandedIcons(state),
  icons: getIcons(state),
  vnfs: getVnfs(state),
  devices: getDevices(state),
  configViewerVisible: getConfigViewerVisible(state),
  openTenant: getOpenTenant(state)
});

class ConfigViewer extends PureComponent {
  constructor(props) {
    super(props);
  }

  getVmDevices = nsInfo => {
    const { vnfs, devices } = this.props;
    return Object.keys(vnfs).filter(
      vnfKey => vnfs[vnfKey].nsInfo == nsInfo
    ).flatMap(
      vnfKey => Object.keys(vnfs[vnfKey].vmDevices).filter(
        vmDevice => vmDevice in devices
      )
    );
  };

  render() {
    console.debug('Config Viewer Render');
    const { expandedIcons, icons, vnfs, configViewerVisible,
            openTenant } = this.props;
    return (
      <Sidebar right={true} hidden={!configViewerVisible}>
        <div className="sidebar__header">
          <div className="sidebar__title-text">Config Viewer</div>
        </div>
        <div className="sidebar__body">
          {expandedIcons && expandedIcons.flatMap(
            iconKey => {
              if (iconKey in icons) {
                const icon = icons[iconKey];
                return (icon.nsInfo
                  ? this.getVmDevices(icon.nsInfo)
                  : [ icon.device ]
                );
              }
              return [];
            }
          ).map(device =>
            <Config key={device} device={device} openTenant={openTenant}/>
          )
        }
        </div>
      </Sidebar>
    );
  }
}

export default connect(mapStateToProps)(ConfigViewer);
