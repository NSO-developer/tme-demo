import './index.css';

import React from 'react';
import { PureComponent, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';

import { LAYOUT } from '../../constants/Layout';

import Container from './Container';
import Connection from './Connection';
import Icon from './Icon';
import DragLayerCanvas from './DragLayerCanvas';
import CustomDragLayer from './CustomDragLayer';
import EditToggle from './EditToggle';
import IconSizeSlider from './IconSizeSlider';
import LoadingOverlay from '../common/LoadingOverlay';

import { getIcons, getConnectionPositions, getDimensions, getLayout,
         getDraggedItem, getIsFetchingIcons, getIsFetchingZoomedIcons,
         getIsFetchingVnfs, getIsFetchingConnections,
         getEditMode } from '../../reducers';

import { fetchTopologyData, subscribeTopologyData } from '../../actions';
import { dimensionsChanged } from '../../actions/layout';


const mapStateToProps = state => ({
  icons: getIcons(state),
  connections: getConnectionPositions(state),
  dimensions: getDimensions(state),
  layout: getLayout(state),
  draggedItem: getDraggedItem(state),
  isFetchingIcons: getIsFetchingIcons(state) || getIsFetchingZoomedIcons(state),
  isFetchingConnections: getIsFetchingConnections(state),
  isFetchingVnfs: getIsFetchingVnfs(state),
  editMode: getEditMode(state)
});

const mapDispatchToProps = {
  dimensionsChanged, fetchTopologyData, subscribeTopologyData
};


class Topology extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.canvasRef = createRef();
    this.hoveredIcon = { name: null };
    this.resize = this.resize.bind(this);
  }

  resize() {
    console.debug('Topology Resize');
    const { offsetWidth, offsetHeight } = this.ref.current;
    const { dimensionsChanged } = this.props;
    const { left, top } = this.ref.current.getBoundingClientRect();
    dimensionsChanged(left, top, offsetWidth, offsetHeight);
  }

  componentDidMount() {
    this.resize();
    const { fetchTopologyData, subscribeTopologyData } = this.props;
    fetchTopologyData();
    subscribeTopologyData();
  }

  render() {
    console.debug('Topology Render');
    const { icons, connections, layout, dimensions, draggedItem,
            isFetchingIcons, isFetchingVnfs, isFetchingConnections,
            editMode } = this.props;
    return (
      <div className={classNames('topology', {
        'topology--edit-mode': editMode
      })}>
        <div className="topology__body">
          <div className="topology__layer topology__layer--background">
            {layout && Object.keys(layout).map(name =>
              <Container key={name} name={name}/>)}
          </div>
          <div className="topology__layer topology__layer--foreground">
            <div className="topology__header"/>
            <div className="topology__body" ref={this.ref}>
              <ReactResizeDetector handleWidth handleHeight
                onResize={this.resize}
                refreshMode="debounce"
                refreshRate={500}
              />
              {dimensions &&
                <div className="topology__layer">
                  {connections.map(connection =>
                    <Connection key={connection.key} {...connection}/>
                  )}
                  {Object.keys(icons).map(key =>
                    <Icon key={key} name={key} hoveredIcon={this.hoveredIcon}/>
                  )}
                  <DragLayerCanvas
                    dimensions={dimensions}
                    canvasRef={this.canvasRef}
                  />
                  <CustomDragLayer
                    hoveredIcon={this.hoveredIcon}
                    canvasRef={this.canvasRef}
                  />
                  <LoadingOverlay items={[
                    { isFetching: isFetchingIcons, label: 'Fetching Icons...' },
                    { isFetching: isFetchingVnfs, label: 'Fetching Vnfs...' },
                    { isFetching: isFetchingConnections,
                      label: 'Fetching Connections...' }
                  ]}/>
                </div>
              }
            </div>
          </div>
        </div>
        <div className="topology__footer">
          <div className="topology__footer-content">
            <EditToggle/>
            {dimensions && <IconSizeSlider/>}
          </div>
          <div className={classNames('container__layer', 'container__overlay', {
            'container__overlay--inactive': draggedItem &&
              draggedItem.icon !== 'new-network-service'
          })}/>
        </div>
      </div>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Topology);
