import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';

import { INTERFACE } from '../../constants/ItemTypes';

import RoundButton from './RoundButton';

import { connectionSelected, iconSelected,
         itemDragged } from '../../actions/uiState';


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
  connectDragSource: connect.dragSource()
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
