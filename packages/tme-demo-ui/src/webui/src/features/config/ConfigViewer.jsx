import './config.css';
import React from 'react';
import { useSelector } from 'react-redux';

import ExpandedIcon from './ExpandedIcon';
import Sidebar from 'features/common/Sidebar';

import { usePlatformsQuery } from 'features/topology/Icon';
import { getExpandedIcons,
         getConfigViewerVisible } from 'features/topology/topologySlice';


function ConfigViewer() {
  console.debug('Config Viewer Render');
  const expandedIcons = useSelector((state) => getExpandedIcons(state));
  const configViewerVisible = useSelector((state) => getConfigViewerVisible(state));
  const platforms = usePlatformsQuery().data;

  return (
    <Sidebar right={true} hidden={!configViewerVisible}>
      <div className="header">
        <div className="header__title-text">Config Viewer</div>
      </div>
      <div className="accordion__group">
        {platforms && expandedIcons && expandedIcons.map(
          icon => <ExpandedIcon key={icon} name={icon}/>)
        }
      </div>
    </Sidebar>
  );
}

export default ConfigViewer;
