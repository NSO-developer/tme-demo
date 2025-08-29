import React from 'react';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';

import Container from './Container';
import Connection, { useConnectionsQuery } from './Connection';
import Icon, { useIconsQuery, useZoomedIconsQuery, usePlatformsQuery, useAuthgroupsQuery } from './Icon';
import { useVnfQueries } from './Vnf';
import DragLayerCanvas from './DragLayerCanvas';
import CustomDragLayer from './CustomDragLayer';
import LoadingOverlay from '../common/LoadingOverlay';

import { LayoutContextProvider, getZoomedLayout,
         useLayoutsQuery, useZoomedLayoutsQuery } from './LayoutContext';
import { dimensionsChanged } from './topologySlice';
import { fetchStatus } from 'api/query';


const TopologyBody = React.memo(function TopologyBody () {
  console.debug('TopologyBody Render');

  const dispatch = useDispatch();

  const ref = useRef(null);
  const canvasRef = useRef();

  const layouts = useLayoutsQuery();
  const zoomedLayouts = useZoomedLayoutsQuery();
  const icons = useIconsQuery();
  const zoomedIcons = useZoomedIconsQuery();
  const connections = useConnectionsQuery();
  const platforms = usePlatformsQuery();
  const vnfs = useVnfQueries();
  const authgroups = useAuthgroupsQuery();

  const resize = () => {
    console.debug('Topology Resize');
    const { offsetWidth: width, offsetHeight: height } = ref.current;
    const { left, top } = ref.current.getBoundingClientRect();
    dispatch(dimensionsChanged({ width, height, left, top }));
  };

  return (
    <LayoutContextProvider>
      <div className="topology">
        <div className="header">
          <span className="header__title-text">Select a topology...</span>
        </div>
        <div className="component__layer">
          {layouts.data?.flatMap(({ name }) => [
            name,
            ...getZoomedLayout(zoomedLayouts.data, name).map(({ name }) => name)
          ]).map(container =>
            <Container key={container} name={container} />
          )}
        </div>
        <div className="component__layer topology__body-placeholder">
          <div className="topology__body" ref={ref}>
            <ReactResizeDetector handleWidth handleHeight
              onResize={resize}
              refreshMode="debounce"
              refreshRate={500}
            />
              {icons.data && vnfs && connections.data?.map(
                ({ keypath, endpoint1Device, endpoint2Device }) =>
                  <Connection
                    key={`${endpoint1Device} - ${endpoint2Device}`}
                    keypath={keypath}
                    aEndDevice={endpoint1Device}
                    zEndDevice={endpoint2Device}
                  />
              )}
              {vnfs && icons.data?.map(({ id, name }) =>
                  <Icon key={name} name={name} />
              )}
              <DragLayerCanvas canvasRef={canvasRef} />
              <CustomDragLayer canvasRef={canvasRef} />
          </div>
        </div>
      </div>
      <LoadingOverlay items={{
        'Layouts':        fetchStatus(layouts),
        'Zoomed Layouts': fetchStatus(zoomedLayouts),
        'Icons':          fetchStatus(icons),
        'Zoomed Icons':   fetchStatus(zoomedIcons),
        'Connections':    fetchStatus(connections),
        'Platforms':      fetchStatus(platforms),
        'VNFs':           fetchStatus(vnfs)
      }}/>
    </LayoutContextProvider>
  );
});

export default TopologyBody;
