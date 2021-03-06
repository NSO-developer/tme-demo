import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DragLayer } from 'react-dnd';

import * as Colours from '../../constants/Colours';
import { LABEL_FONT } from '../../constants/Icons';
import { INTERFACE, ICON } from '../../constants/ItemTypes';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO } from '../../constants/Layout';

import { getDraggedItem, getConnections,getVnfs, getIconPositions,
         getIconsByDevice, getIconsByNsInfo, getVnfsByDevice,
         getDimensions, getLayout, getActualIconSize, getZoomedContainer,
         calculateConnectionPositions } from '../../reducers';

import { restrictPos, pointAlongLine } from '../../utils/UiUtils';


const getEndpointIcon = (conn, endpoint, iconsByDevice) => {
  return iconsByDevice[conn[`ep${endpoint}Device`]];
};

const mapStateToProps = state => {
  const draggedItem = getDraggedItem(state);
  const connections = getConnections(state);
  const iconsByDevice = getIconsByDevice(state);
  const iconsByNsInfo = getIconsByNsInfo(state);
  const vnfsByDevice = getVnfsByDevice(state);
  const vnfs = getVnfs(state);
  const iconPositions = getIconPositions(state);
  const zoomedContainer = getZoomedContainer(state);
  let overlayConnections = undefined;
  if (draggedItem) {
    const { icon, fromIcon, connection, endpoint } = draggedItem;
    overlayConnections = icon
        ? calculateConnectionPositions(connections, iconsByDevice,
            iconsByNsInfo, vnfsByDevice, vnfs, iconPositions,
            zoomedContainer, icon)
        : [ {
            name: connection,
            from: iconPositions[fromIcon ? fromIcon : getEndpointIcon(
              connections[connection], endpoint === 1 ? 2 : 1, iconsByDevice)]
          } ];
  }
  return {
    overlayConnections,
    iconPositions,
    dimensions: getDimensions(state),
    layout: getLayout(state),
    iconSize: getActualIconSize(state)
  };
};


@DragLayer(monitor => {
  const item = monitor.getItem();
  const itemType = monitor.getItemType();
  let pos = null;
  if (monitor.isDragging() && (itemType === INTERFACE || itemType === ICON) ) {
    // IE and Edge fix: The ghost image is offset from the initial mouse
    // coordinates at mouseDown, not dragStart, so need to account for this
    // slight difference in offset (since the ghost image can't easily be
    // hidden on these browsers).
    const initialClientOffset = monitor.getInitialClientOffset();
    const offsetDifference = monitor.getDifferenceFromInitialOffset();
    if (initialClientOffset && offsetDifference) {
      const { mouseDownPos } = item;
      const xMouseDownPos = mouseDownPos ? mouseDownPos.x : 0;
      const yMouseDownPos = mouseDownPos ? mouseDownPos.y : 0;
      pos = {
        x: item.x + offsetDifference.x + initialClientOffset.x - xMouseDownPos,
        y: item.y + offsetDifference.y + initialClientOffset.y - yMouseDownPos
      };
    }
  }
  return { item, itemType, pos };
})
class CustomDragLayer extends PureComponent {
  constructor(props) {
    super(props);
    this.ctx = null;
  }

  componentDidMount() {
    this.ctx = this.props.canvasRef.current.getContext('2d');
  }

  drawConnection(p1, p2) {
    const { ctx } = this;
    const { iconSize } = this.props;
    const circleSize = iconSize * CIRCLE_ICON_RATIO;
    const lineWidth = iconSize * LINE_ICON_RATIO;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = Colours.SELECTED_CONNECTION;
    ctx.lineCap = 'square';
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = Colours.SELECTED_CONNECTION;
    ctx.arc(p1.x, p1.y, circleSize / 2, 0, 2 * Math.PI);
    ctx.arc(p2.x, p2.y, circleSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawRoundedRect(x, y, width, height, radius) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  drawLabel(x, y, text) {
    const { ctx } = this;
    ctx.font = LABEL_FONT;

    const width = ctx.measureText(text).width + 8;
    const height = 23;
    const radius = 6;

    ctx.fillStyle = Colours.LABEL_BACKGROUND;
    ctx.lineWidth = 1;
    ctx.strokeStyle = Colours.LABEL_BORDER;
    this.drawRoundedRect(x - width / 2, y, width, height, radius);

    ctx.textAlign = 'center';
    ctx.fillStyle = Colours.LABEL_TEXT;
    ctx.beginPath();
    ctx.fillText(text, x, y + 16);
  }

  render() {
    const {
      overlayConnections,
      iconPositions,
      iconSize,
      dimensions,
      layout,
      item,
      itemType,
      pos,
      hoveredIcon
    } = this.props;

    if (!this.ctx) {
      return null;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    if (!pos || !overlayConnections) {
      return null;
    }
    const iconRadius = iconSize / 2;

    switch (itemType) {
      case ICON: {
        const { x, y } = restrictPos(pos.x, pos.y, layout[item.container]);

        Object.keys(overlayConnections).forEach(key => {
          const { from } = overlayConnections[key];
          const p1 = pointAlongLine(x, y, from.x, from.y, iconRadius);
          const p2 = pointAlongLine(from.x, from.y, x, y, iconRadius);
          this.drawConnection(p1, p2);
        });

        if (item.imgReady) {
          ctx.drawImage(item.img, x - iconRadius, y - iconRadius);
        }
        this.drawLabel(x, y + iconRadius + 4, item.label);
        break;
      }

      case INTERFACE: {
        const conn = overlayConnections[0];
        let from = conn.from;
        let to = hoveredIcon.name
          ? iconPositions[hoveredIcon.name]
          : pos;

        if (hoveredIcon.name) {
          to = pointAlongLine(to.x, to.y, from.x, from.y, iconRadius);
        }

        from = pointAlongLine(from.x, from.y, to.x, to.y, iconRadius);
        this.drawConnection(from, to);
      }
    }

    return null;
  }
}

export default connect(mapStateToProps)(CustomDragLayer);
