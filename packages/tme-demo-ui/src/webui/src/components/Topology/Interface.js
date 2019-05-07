import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';

import { INTERFACE } from '../../constants/ItemTypes';
import { SELECTED_CONNECTION } from '../../constants/Colours';

import RoundButton from './RoundButton';

import { connectionSelected, iconSelected,
         itemDragged } from '../../actions/uiState';

import { isSafari, connectPngDragPreview } from '../../utils/UiUtils';


const mapDispatchToProps = { itemDragged, connectionSelected, iconSelected };

const interfaceSource = {
  beginDrag: ({ connection, endpoint, fromIcon, fromDevice, x, y,
    itemDragged, connectionSelected }, monitor, { mouseDownPos }) => {
    const item = { connection, endpoint, fromIcon, fromDevice, x, y,
                   mouseDownPos };
    requestAnimationFrame(() => {
      itemDragged(item);
      connectionSelected(undefined);
    });
    return item;
  },

  endDrag: ({ connection, fromIcon,
    itemDragged, iconSelected, connectionSelected }, monitor) => {
    itemDragged(undefined);
    if (!monitor.didDrop()) {
      fromIcon ? iconSelected(fromIcon) : connectionSelected(connection);
    }
  },

  canDrag: ({ active, disabled }) => (active && !disabled)
};


@DragSource(INTERFACE, interfaceSource, connect => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
}))
class Interface extends PureComponent {
  constructor(props) {
    super(props);
    this.mouseDownPos = {};
  }

  handleMouseDown = event => {
    this.mouseDownPos = {
      x: event.clientX,
      y: event.clientY
    };
  }

  componentDidMount() {
    const { connectDragPreview, size } = this.props;
    const actualSize = size * 2;

    // The drag preview is not captured correctly on Safari,
    // so draw a green circle instead.
    isSafari && connectPngDragPreview(renderToStaticMarkup(
      <svg
        width={`${actualSize}px`}
        height={`${actualSize}px`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${actualSize} ${actualSize}`}
      >
        <circle
          className="topology__svg-icon-circle"
          fill={SELECTED_CONNECTION}
          cx={actualSize/2} cy={actualSize/2} r={actualSize/2}
        />
      </svg>),
      actualSize, connectDragPreview, false
    );
  }

  render() {
    console.debug('Interface Render');
    const { connectDragSource, onClick, pcX, pcY,
            type, size, active, expanded, disabled, tooltip } = this.props;

    return (
      <RoundButton
        ref={instance => connectDragSource(instance)}
        onClick={onClick}
        onMouseDown={this.handleMouseDown}
        pcX={pcX}
        pcY={pcY}
        type={type}
        size={size}
        active={active}
        expanded={expanded}
        disabled={disabled}
        tooltip={tooltip}
      />
    );
  }
}

export default connect(null, mapDispatchToProps)(Interface);
