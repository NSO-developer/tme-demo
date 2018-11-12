import './index.css';

import React from 'react';
import { PureComponent, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { LAYOUT } from '../../constants/Layout';

import Container from './Container';
import Connection from './Connection';
import Icon from './Icon';
import DragLayerCanvas from './DragLayerCanvas';
import CustomDragLayer from './CustomDragLayer';
import EditToggle from './EditToggle';
import IconSizeSlider from './IconSizeSlider';
import LoadingOverlay from '../common/LoadingOverlay';

import { getIcons, getConnectionPositions, getActualIconSize, getDimensions,
         getIsFetchingIcons, getIsFetchingVnfs, getIsFetchingConnections,
         getEditMode } from '../../reducers';

import { fetchTopologyData } from '../../actions';
import { dimensionsChanged } from '../../actions/layout';


const mapStateToProps = state => ({
  icons: getIcons(state),
  connections: getConnectionPositions(state),
  iconSize: getActualIconSize(state),
  dimensions: getDimensions(state),
  isFetchingIcons: getIsFetchingIcons(state),
  isFetchingConnections: getIsFetchingConnections(state),
  isFetchingVnfs: getIsFetchingVnfs(state),
  editMode: getEditMode(state)
});

const mapDispatchToProps = { dimensionsChanged, fetchTopologyData };


class Topology extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.canvasRef = createRef();
    this.hoveredIcon = { id: null };
  }

  resize() {
    const { offsetWidth, offsetHeight } = this.ref.current;
    const { dimensionsChanged } = this.props;
    dimensionsChanged(offsetWidth, offsetHeight);
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    const { fetchTopologyData } = this.props;
    fetchTopologyData();
  }

  render() {
    console.debug('Topology Render');
    const { icons, connections, iconSize, dimensions,
            isFetchingIcons, isFetchingVnfs, isFetchingConnections,
            editMode } = this.props;

    return (
      <div className={classNames('topology__container', {
        'topology__container--edit-mode': editMode
      })}>
        <div className="topology__layer topology__layer--background">
          {LAYOUT.map((container, idx) =>
            <Container
              key={idx}
              idx={idx}
              id={container.id}
              width={container.width}
              length={LAYOUT.length}
            />
          )}
        </div>
        <div className="topology__layer topology__layer--foreground">
          <div className="topology__header">
            {LAYOUT.map((container, idx) =>
              <div
                key={idx}
                className="container__title-text"
                style={{
                  width: `${container.width}%`,
                  paddingLeft: (idx === 0 || idx === LAYOUT.length - 1) &&
                    `${Math.round(iconSize / 4)}px`
              }}>
                {container.title}
              </div>
            )}
          </div>
          <div className="topology__body" ref={this.ref}>
            {dimensions &&
              <Fragment>
                {connections.map(connection =>
                  <Connection key={connection.key} {...connection}/>
                )}
                {Object.keys(icons).map(key =>
                  <Icon key={key} id={key} hoveredIcon={this.hoveredIcon}/>
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
              </Fragment>
            }
          </div>
          <div className="topology__footer">
            <EditToggle/>
            <IconSizeSlider/>
          </div>
        </div>
      </div>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Topology);
