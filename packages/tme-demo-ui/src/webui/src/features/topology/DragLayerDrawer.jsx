import { useState, useEffect, useContext } from 'react';
import { useDragLayer } from 'react-dnd';

import * as Colours from 'constants/Colours';
import { LABEL_FONT } from 'constants/Icons';
import { INTERFACE, ICON } from 'constants/ItemTypes';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO } from 'constants/Layout';

import { LayoutContext} from './LayoutContext';
import { pointAlongLine } from './Connection';


function DragLayerDrawer({ canvasRef, fromIcons, toIcon }) {
  //console.debug('DragLayerDrawer Render');

  const [ ctx, setCtx ] = useState(null);
  const { dimensions, iconSize, restrictPos } = useContext(LayoutContext);

  const { item, itemType, pos } = useDragLayer(monitor => {
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
  });

  useEffect(() => {
    setCtx(canvasRef.current.getContext('2d'));
  });

  const drawConnection = (p1, p2) => {
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
  };

  const drawRoundedRect = (x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  const drawLabel = (x, y, text) => {
    ctx.font = LABEL_FONT;

    const width = ctx.measureText(text).width + 8;
    const height = 23;
    const radius = 6;

    ctx.fillStyle = Colours.LABEL_BACKGROUND;
    ctx.lineWidth = 1;
    ctx.strokeStyle = Colours.LABEL_BORDER;
    drawRoundedRect(x - width / 2, y, width, height, radius);

    ctx.textAlign = 'center';
    ctx.fillStyle = Colours.LABEL_TEXT;
    ctx.beginPath();
    ctx.fillText(text, x, y + 16);
  };

  if (!ctx) {
    return null;
  }

  ctx.clearRect(0, 0, dimensions.width, dimensions.height);

  if (!pos) {
    return null;
  }
  const iconRadius = iconSize / 2;

  switch (itemType) {
    case ICON: {
      const { icon } = item;
      const { x, y } = restrictPos(pos, icon.container);

      fromIcons.forEach(from => {
        if (!from.hidden) {
          const p1 = pointAlongLine(x, y, from.x, from.y, iconRadius);
          const p2 = pointAlongLine(from.x, from.y, x, y, iconRadius);
          drawConnection(p1, p2);
        }
      });

      if (icon.imgReady) {
        ctx.drawImage(icon.img, x - iconRadius, y - iconRadius);
      }
      drawLabel(x, y + iconRadius + 4, icon.name);
      break;
    }

    case INTERFACE: {
      if (!fromIcons || fromIcons.length === 0) {
        return null;
      }

      let from = fromIcons[0];
      let to = toIcon ? toIcon : pos;

      if (toIcon) {
        to = pointAlongLine(to.x, to.y, from.x, from.y, iconRadius);
      }

      from = pointAlongLine(from.x, from.y, to.x, to.y, iconRadius);
      drawConnection(from, to);
    }
  }

  return null;
}

export default DragLayerDrawer;
