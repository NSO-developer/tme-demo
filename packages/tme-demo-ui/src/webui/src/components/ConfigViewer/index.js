import './index.css';
import React from 'react';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';

import Sidebar from '../Sidebar';
import Config from './Config';
import { getExpandedIcons, getIcons,
         getConfigViewerVisible } from '../../reducers';

const mapStateToProps = state => ({
  expandedIcons: getExpandedIcons(state),
  icons: getIcons(state),
  configViewerVisible: getConfigViewerVisible(state)
});

class ConfigViewer extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    console.debug('Config Viewer Render');
    const { expandedIcons, icons, configViewerVisible } = this.props;
    return (
      <Sidebar right={true} hidden={!configViewerVisible}>
        <div className="sidebar__header">
          <div className="sidebar__title-text">Config Viewer</div>
        </div>
        <div className="sidebar__body">
          {expandedIcons && expandedIcons.filter(
            key => key in icons && icons[key].device).map(
              key => <Config key={key} device={icons[key].device}/>)}
        </div>
      </Sidebar>
    );
  }
}

export default connect(mapStateToProps)(ConfigViewer);
