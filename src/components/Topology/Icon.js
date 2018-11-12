import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { DragSource, DropTarget } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { ICON, INTERFACE, ENDPOINT } from '../../constants/ItemTypes';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO,
         ICON_SPACING } from '../../constants/Layout';
import { BTN_ADD } from '../../constants/Icons';

import Interface from './Interface';
import IconHighlight from '../icons/IconHighlight';
import IconSvg from '../icons/IconSvg';

import { getIcon, getActualIconSize, getSelectedIcon, getIsIconExpanded,
         getIconVnfs, getConnections, getIconPosition,
         getDimensions, getLayout, getEditMode } from '../../reducers';

import { iconSelected, connectionSelected,
         itemDragged, iconExpandToggled } from '../../actions/uiState';
import { moveIcon } from '../../actions/icons';
import { addConnection, moveConnection } from '../../actions/connections';

import { restrictPos, pxToPc } from '../../utils/UiUtils';


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

const mapStateToPropsFactory = (initialState, initialProps) => {
  const { id } = initialProps;
  return state => ({
    ...getIcon(state, id),
    label: id,
    size: getActualIconSize(state),
    selected: getSelectedIcon(state) === id,
    expanded: getIsIconExpanded(state, id),
    vnfs: getIconVnfs(state, id),
    connections: getConnections(state),
    positions: getIconPosition(state, id),
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
  beginDrag: ({ id }) => ({ iconId: id }),
  canDrag: ({editMode}) => !editMode
};

// Edit mode interface drop
const iconTarget = {
  drop: (
    { device, nsInfo, connectionSelected, addConnection, moveConnection },
    monitor
  ) => {
    const { connectionId, fromDevice, endpoint } = monitor.getItem();

    if (fromDevice) {
      const newConnectionId = `${fromDevice}-${device}`;
      addConnection(newConnectionId, fromDevice, device);
      connectionSelected(newConnectionId);

    } else {
      moveConnection(connectionId, endpoint, device, nsInfo);
      connectionSelected(connectionId);
    }
  },

  canDrop: ({ id, device, connections }, monitor) => {
    const { connectionId, fromDevice, endpoint } = monitor.getItem();
    const from = fromDevice ? fromDevice :
      connections[connectionId][`ep${endpoint === 1 ? 2 : 1}Device`];
    // Can't drop interface if:
    //  - From icon is the same as the target icon
    //  - From icon is not a device
    //  - Target icon is not a device
    //  - Connection from icon to target already exists (return statement)
    if (from === id || !from || !device) {
      return false;
    }
    return (
      Object.keys(connections).findIndex(key => {
        const conn = connections[key];
        return (
          (conn.ep1Device === from && conn.ep2Device === id) ||
          (conn.ep1Device === id && conn.ep2Device === from)
        );
      }) === -1
    );
  }
};

// Edit mode icon drag
const iconSource = {
  beginDrag: ({
    id, type, container, status, label, size, positions, itemDragged
  }) => {
    const img = new Image();
    img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(
      <IconSvg type={type} status={status} size={size} />
    ))}`;
    const { x, y } = positions[id];
    const item = { iconId: id, x, y, img, label, container };
    itemDragged(item);
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
  handleOnClick = () => {
    const { id, device, editMode,
      iconSelected, iconExpandToggled } = this.props;
    if (editMode && device ) {
      iconSelected(id);
    } else if (!editMode) {
      iconExpandToggled(id);
    }
  }

  moveIcon = (x, y) => {
    const { id, container, dimensions, layout, moveIcon } = this.props;
    const { left, top, width, height } = layout[container].pc;
    const { pcX, pcY } =
      pxToPc(restrictPos(x, y, layout[container]), dimensions);
    moveIcon(id, (pcX - left) / width, (pcY - top) / height);
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectIconDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true
    });
  }

  render() {
    console.debug('Icon Render');
    const {
      id,
      device,
      type,
      container,
      status,
      label,
      size,
      selected,
      expanded,
      vnfs,
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
    if (isOver && hoveredIcon.id !== id && canDrop) {
      hoveredIcon.id = id;
    } else if (!isOver && hoveredIcon.id === id) {
      hoveredIcon.id = null;
    }

    const hasVnfs = vnfs && vnfs.length > 0;
    const top = positions[hasVnfs ? vnfs[0].id : id];
    const height = (expanded && hasVnfs) ? vnfs.length : 1;
    const outlineSize = expanded ? size * ICON_SPACING : size;
    const outlineRadius = outlineSize / 2;

    return (
      <Fragment>
        <div
          onClick={this.handleOnClick}
          id={`${id}-outline`}
          className={classNames('icon__outline', {
            'icon__outline--hidden': !expanded
          })}
          style={{
            ...positionStyle(top, outlineSize),
            borderRadius: `${outlineRadius}px`,
            height: `${height * outlineSize}px`,
            width: `${outlineSize}px`
          }}
        >
          <div
            className="icon__vnf-connection"
            style={{
              height: `${(height - 1) * outlineSize}px`,
              width: `${size * LINE_ICON_RATIO}px`,
              top: `${outlineRadius}px`
            }}
          />
        </div>
        {vnfs && vnfs.map((vnf, index) =>
          <div
            key={vnf.id}
            id={`${vnf.id}-vnf`}
            className={classNames('icon__container', {
              'icon__container--hidden': !expanded
            })}
            style={positionStyle(positions[vnf.id], size)}
          >
            <div className="icon__svg-wrapper" style={svgStyle(size)} >
              <IconSvg type={vnf.type} status={status} size={size} />
            </div>
            <div className="icon__label icon__label--vnf" >
              <span className="icon__label-text">{vnf.name}</span>
            </div>
          </div>
        )}
        <div
          className={classNames('icon__container', {
            'icon__container--hidden': hoveredIcon.id !== id
          })}
          style={positionStyle(positions[id], size*2)}
        >
          <IconHighlight size={size*2}/>
        </div>
        {connectEndpointDragPreview(
          <div
            id={`${id}-icon`}
            className={classNames('icon__container', {
              'icon__container--expanded': expanded,
              'icon__container--dragging': isDragging
            })}
            style={positionStyle(positions[id], size)}
          >
            <div
              className="icon__svg-wrapper"
              style={{
                height: `${(height * outlineSize + size) / 2}px`,
                width: `${size}px`
              }}
            />
            <div className="icon__label">
              <span className="icon__label-text">{label}</span>
            </div>
            {connectEndpointDragSource(
              connectIconDropTarget(
                connectIconDragSource(
                  <div
                    onClick={this.handleOnClick}
                    className={classNames('icon__svg-wrapper',
                      'icon__svg-wrapper-absolute', {
                      'icon__svg-wrapper--hidden': expanded && vnfs.length > 0
                    })}
                    style={svgStyle(size)}
                  >
                    <IconSvg type={type} status={status} size={size}/>
                    <Interface
                      fromIcon={id}
                      fromDevice={device}
                      x={positions[id].x}
                      y={positions[id].y}
                      pcX={50}
                      pcY={50}
                      size={size * CIRCLE_ICON_RATIO}
                      active={selected && editMode}
                      type={BTN_ADD}
                    />
                  </div>
                )
              )
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default connect( mapStateToPropsFactory, mapDispatchToProps)(Icon);
