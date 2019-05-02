import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { DragSource, DropTarget } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';
import Tippy from '@tippy.js/react';

import { ICON, INTERFACE, ENDPOINT } from '../../constants/ItemTypes';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO,
         ICON_VNF_SPACING, ICON_VM_SPACING } from '../../constants/Layout';
import { BTN_ADD } from '../../constants/Icons';
import { HIGHLIGHT, HOVER } from '../../constants/Colours';

import Interface from './Interface';
import IconHighlight from '../icons/IconHighlight';
import IconSvg from '../icons/IconSvg';

import { getIcon, getActualIconSize, getSelectedIcon, getIsIconExpanded,
         getHighlightedDevices, getIconVnfs, getConnections,
         getIconPosition, getDevice, getDimensions, getLayout,
         getEditMode } from '../../reducers';

import { iconSelected, connectionSelected,
         itemDragged, iconExpandToggled } from '../../actions/uiState';
import { moveIcon } from '../../actions/icons';
import { addConnection, moveConnection } from '../../actions/connections';

import { pxCoordToSafePc } from '../../utils/UiUtils';


// === Util functions =========================================================

function positionStyle(position, size) {
  return {
    left: `${position.pcX}%`,
    top: `${position.pcY}%`,
    transform: `translate(-50%, ${-size/2}px)`,
  };
}

function svgStyle(size) {
  return {
    height: `${size}px`,
    width: `${size}px`,
  };
}

// === Mapping functions ======================================================

const getIconHighlightedDevicesFactory = device => createSelector(
  [getIconVnfs, getHighlightedDevices], (vnfs, deviceList) => {
    console.debug('Re-select highlighted devices');
    const devices = deviceList ? vnfs.flatMap(
        ({ vmDevices }) => vmDevices.map(({ device }) => device)
      ).concat([ device ])
        .filter(device => deviceList.includes(device)) : [];
    return devices.length == 0 ? undefined : devices;
  }
);

const mapStateToPropsFactory = (initialState, initialProps) => {
  const { name } = initialProps;
  const { device } = getIcon(initialState, name);
  const getIconHighlightedDevices = getIconHighlightedDevicesFactory(device);
  return state => ({
    ...getIcon(state, name),
    label: name,
    size: getActualIconSize(state),
    selected: getSelectedIcon(state) === name,
    expanded: getIsIconExpanded(state, name),
    highlightedDevices: getIconHighlightedDevices(state, name),
    vnfs: getIconVnfs(state, name),
    connections: getConnections(state),
    deviceInfo: getDevice(state, device),
    positions: getIconPosition(state, name),
    dimensions: getDimensions(state),
    layout: getLayout(state),
    editMode: getEditMode(state)
  });
};

const mapDispatchToProps = {
  itemDragged, iconSelected, iconExpandToggled, moveIcon,
  connectionSelected, addConnection, moveConnection
};


// === Drag and Drop Specs ====================================================

// Standard mode endpoint drag
const endpointSource = {
  beginDrag: ({ name }) => ({ icon: name }),
  canDrag: ({editMode}) => !editMode
};

// Edit mode interface drop
const iconTarget = {
  drop: (
    { device, nsInfo, connectionSelected, addConnection, moveConnection },
    monitor
  ) => {
    const { connection, fromDevice, endpoint } = monitor.getItem();

    if (fromDevice) {
      const newConnectionName = `${fromDevice}-${device}`;
      addConnection(newConnectionName, fromDevice, device);
      connectionSelected(newConnectionName);

    } else {
      moveConnection(connection, endpoint, device, nsInfo);
      connectionSelected(connection);
    }
  },

  canDrop: ({ name, device, connections }, monitor) => {
    const { connection, fromDevice, endpoint } = monitor.getItem();
    const from = fromDevice ? fromDevice :
      connections[connection][`ep${endpoint === 1 ? 2 : 1}Device`];
    // Can't drop interface if:
    //  - From icon is the same as the target icon
    //  - From icon is not a device
    //  - Target icon is not a device
    //  - Connection from icon to target already exists (return statement)
    if (from === device || !from || !device) {
      return false;
    }
    return (
      Object.keys(connections).findIndex(key => {
        const conn = connections[key];
        return (
          (conn.ep1Device === from && conn.ep2Device === device) ||
          (conn.ep1Device === device && conn.ep2Device === from)
        );
      }) === -1
    );
  }
};

// Edit mode icon drag
const iconSource = {
  beginDrag: ({
    name, type, container, label, size, positions, itemDragged
  }, monitor, { mouseDownPos, getStatus }) => {
    const img = new Image();
    img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(
      <IconSvg type={type} status={getStatus()} size={size} />
    ))}`;
    const { x, y } = positions[name];
    const item = { icon: name, imgReady: false,
                   x, y, img, label, container, mouseDownPos };
    img.onload = () => { item.imgReady = true; };
    requestAnimationFrame(() => { itemDragged(item); });
    return item;
  },

  endDrag: ({ itemDragged }, monitor, component) => {
    const offset = monitor.getDifferenceFromInitialOffset();
    const { x, y } = monitor.getItem();
    itemDragged(undefined);
    component.moveIcon(x + offset.x, y + offset.y);
  },

  canDrag: ({ editMode }) => editMode
};


// === Component ==============================================================

@DragSource(ENDPOINT, endpointSource, connect => ({
  connectEndpointDragPreview: connect.dragPreview(),
  connectEndpointDragSource: connect.dragSource()
}))
@DropTarget(INTERFACE, iconTarget, (connect, monitor) => ({
  connectIconDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
@DragSource(ICON, iconSource, (connect, monitor) => ({
  connectIconDragPreview: connect.dragPreview(),
  connectIconDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class Icon extends PureComponent {
  constructor(props) {
    super(props);
    this.mouseDownPos = {};
  }

  handleOnClick = () => {
    const { name, device, editMode,
      iconSelected, iconExpandToggled } = this.props;
    if (editMode && device ) {
      iconSelected(name);
    } else if (!editMode) {
      iconExpandToggled(name);
    }
  }

  moveIcon = (x, y) => {
    const { name, container, dimensions, layout, moveIcon } = this.props;
    moveIcon(name, pxCoordToSafePc(x, y, layout[container], dimensions));
  }

  handleMouseDown = event => {
    this.mouseDownPos = {
      x: event.clientX,
      y: event.clientY
    };
  }

  tooltipContent = (status, vnfIndex) => {
    const { name, device, nsInfo, vnfs, deviceInfo } = this.props;
    if (device) {
      return (
        <table className="tooltip">
          <tbody>
            <tr><td>Device:</td><td>{device}</td></tr>
            <tr><td>Status:</td><td>{status}</td></tr>
            {status === 'reachable' &&
              <Fragment>
                <tr><td>Platform:</td><td>{deviceInfo.platform}</td></tr>
                <tr><td>Version:</td><td>{deviceInfo.version}</td></tr>
                <tr><td>Model:</td><td>{deviceInfo.model}</td></tr>
              </Fragment>
            }
          </tbody>
        </table>
      );
    } else if (nsInfo) {
      if (!Number.isInteger(vnfIndex)) {
        return (
          <table className="tooltip">
            <tbody>
              <tr><td>NS Info:</td><td>{nsInfo}</td></tr>
              <tr><td>VNF Count:</td><td>{vnfs.length}</td></tr>
            </tbody>
          </table>
        );
      } else {
        const vnf = vnfs[vnfIndex];
        return (
          <table className="tooltip">
            <tbody>
              <tr><td>VNF Info:</td><td>{vnf.vnfInfo}</td></tr>
              <tr><td>VDU:</td><td>{vnf.vdu}</td></tr>
              <tr><td>Status:</td><td>{status}</td></tr>
            </tbody>
          </table>
        );
      }
    } else {
      return name;
    }
  }

  getStatus = () => {
    const { device, nsInfo, vnfs, deviceInfo } = this.props;
    return (device
      ? deviceInfo && deviceInfo.platform ? 'reachable' : 'unreachable'
      : nsInfo ? vnfs.length > 0 ? 'ready' : 'init' : undefined
    );
  }

  componentDidMount() {
    this.props.connectIconDragPreview(getEmptyImage(), {});
  }

  render() {
    console.debug('Icon Render');
    const {
      name,
      device,
      nsInfo,
      type,
      container,
      label,
      size,
      selected,
      expanded,
      highlightedDevices,
      vnfs,
      deviceInfo,
      positions,
      editMode,
      connectEndpointDragPreview,
      connectEndpointDragSource,
      connectIconDropTarget,
      connectIconDragSource,
      isOver,
      canDrop,
      isDragging,
      hoveredIcon
    } = this.props;
    if (isOver && hoveredIcon.name !== name && canDrop) {
      hoveredIcon.name = name;
    } else if (!isOver && hoveredIcon.name === name) {
      hoveredIcon.name = null;
    }

    let status = this.getStatus();
    const hasVnfs = vnfs && vnfs.length > 0;
    const top = positions[hasVnfs ? vnfs[0].name : name];
    const outlineSize = expanded ? size * ICON_VNF_SPACING : size;
    const outlineRadius = outlineSize / 2;

    const height = (expanded && hasVnfs)
      ? vnfs.length * outlineSize + vnfs.reduce((accumulator, vnf) =>
          accumulator += (vnf.vmDevices.length - 1) * ICON_VM_SPACING, 0) * size
      : outlineSize;

    return (
      <Fragment>
        <div
          onClick={this.handleOnClick}
          id={`${name}-outline`}
          className={classNames('icon__outline', {
            'icon__outline--expanded': expanded
          })}
          style={{
            ...positionStyle(top, outlineSize),
            borderRadius: `${outlineRadius}px`,
            height: `${height}px`,
            width: `${outlineSize}px`,
          }}
        >
        </div>
        {vnfs && vnfs.map((vnf, vnfIndex) =>
          <Fragment key={vnfIndex}>{
            vnf.linkToPrevious &&
              <div
                className={classNames('icon__vnf-connection', {
                  'icon__vnf-connection--expanded': expanded
                })}
                style={{
                  height: `${expanded ? outlineSize : 0}px`,
                  width: `${size * LINE_ICON_RATIO}px`,
                  left: `${positions[vnf.name].pcX}%`,
                  bottom: `${100 - positions[vnf.name].pcY}%`
                }}
              />}
            {vnf.vmDevices.map((vm, vmIndex) => {
              const vnfVmName = `${vnf.name}${vmIndex > 0 ? `-${vmIndex}` : ''}`;
              if (vm.status === 'error') {
                status = 'error';
              } else if (vm.status !== 'ready' && status !== 'error') {
                status = 'not-ready';
              }
              return <Fragment key={vnfVmName}>
                <div
                  className={classNames('icon__container', {
                    'icon__container--expanded': expanded,
                    'icon__container--hidden': !expanded ||
                      editMode || !highlightedDevices ||
                      !highlightedDevices.includes(vm.device)
                  })}
                  style={positionStyle(positions[vnfVmName], size*2)}
                >
                  <IconHighlight size={size*2} colour={HIGHLIGHT}/>
                </div>
                <div
                  id={`${vnfVmName}-vnf-vm`}
                  className={classNames('icon__container', {
                    'icon__container--expanded': expanded,
                    'icon__container--hidden': !expanded
                  })}
                  style={positionStyle(positions[vnfVmName], size)}
                >
                  <Tippy
                    placement="left"
                    delay="250"
                    content={this.tooltipContent(vm.status, vnfIndex)}
                    isEnabled={!editMode}
                  >
                    <div
                      onClick={this.handleOnClick}
                      className="icon__svg-wrapper"
                      style={svgStyle(size)}
                    >
                      <IconSvg type={vnf.type} status={vm.status} size={size} />
                    </div>
                  </Tippy>
                  {vmIndex === Object.keys(vnf.vmDevices).length - 1 &&
                    <div className="icon__label icon__label--vnf" >
                      <span className="icon__label-text">{vnf.vnfInfo}</span>
                    </div>
                  }
                </div>
              </Fragment>;
            })}
          </Fragment>
        )}
        <div
          className={classNames('icon__container', {
            'icon__container--hidden': hoveredIcon.name !== name
          })}
          style={positionStyle(positions[name], size*2)}
        >
          <IconHighlight size={size*2} colour={HOVER}/>
        </div>
        <div
          className={classNames('icon__container', {
            'icon__container--expanded': expanded,
            'icon__container--hidden': editMode || expanded && vnfs.length > 0
              || !highlightedDevices || highlightedDevices.length == 0
          })}
          style={positionStyle(positions[name], size*2)}
        >
          <IconHighlight size={size*2} colour={HIGHLIGHT}/>
        </div>
        {connectEndpointDragPreview(
          <div
            id={`${name}-icon`}
            className={classNames('icon__container', {
              'icon__container--expanded': expanded,
              'icon__container--dragging': isDragging
            })}
            style={positionStyle(positions[name], size)}
          >
            <div
              className="icon__svg-wrapper icon__svg-wrapper--hidden"
              style={{
                height: `${(height + size) / 2}px`,
                width: `${size}px`
              }}
            />
            <div className="icon__label">
              <span className="icon__label-text">{label}</span>
            </div>
            <Tippy
              placement="left"
              delay="250"
              content={this.tooltipContent(status)}
              isEnabled={!editMode}
            >
              {connectEndpointDragSource(
                connectIconDropTarget(
                  connectIconDragSource(
                    <div
                      onClick={this.handleOnClick}
                      onMouseDown={this.handleMouseDown}
                      className={classNames('icon__svg-wrapper',
                        'icon__svg-wrapper-absolute', {
                        'icon__svg-wrapper--hidden': expanded && vnfs.length > 0
                      })}
                      style={svgStyle(size)}
                    >
                      <IconSvg type={type} status={status} size={size} />
                      <Interface
                        fromIcon={name}
                        fromDevice={device}
                        x={positions[name].x}
                        y={positions[name].y}
                        pcX={50}
                        pcY={50}
                        size={size * CIRCLE_ICON_RATIO}
                        active={selected && editMode}
                        type={BTN_ADD}
                        tooltip="Add Connection (drag me)"
                      />
                    </div>
                  )
                )
              )}
            </Tippy>
          </div>
        )}
      </Fragment>
    );
  }
}

export default connect(mapStateToPropsFactory, mapDispatchToProps)(Icon);
