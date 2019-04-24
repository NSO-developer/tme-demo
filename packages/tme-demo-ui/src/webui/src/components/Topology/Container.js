import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { DropTarget } from 'react-dnd';

import { NETWORK_SERVICE } from '../../constants/ItemTypes';

import { getDraggedItem, getDimensions, getLayout } from '../../reducers';
import { newNetworkServiceToggled } from '../../actions/uiState';

import { pxCoordToSafePc } from '../../utils/UiUtils';


const mapStateToProps = state => ({
  draggedItem: getDraggedItem(state),
  dimensions: getDimensions(state),
  layout: getLayout(state)
});

const mapDispatchToProps = { newNetworkServiceToggled };

const dropTarget = {
  drop({ name, layout, dimensions, newNetworkServiceToggled }, monitor) {
    const { x, y } = monitor.getClientOffset();
    newNetworkServiceToggled(name,
      pxCoordToSafePc(x - dimensions.left, y - dimensions.top,
        layout[name], dimensions)
    );
  }
};

@DropTarget(NETWORK_SERVICE, dropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
class Container extends PureComponent {
  render() {
    console.debug('Container Render');
    const { index, name, width, draggedItem, connectDropTarget,
            isOver } = this.props;
    return (
      <div
        className="container"
        style={{ width: `${width}%` }}
      >
        <div
          className={classNames('container__layer', {
            'container__background': (index % 2 === 0),
            'container__background--alt': (index % 2 !== 0),
            'container__background--not-first': (index !== 0)
          })}
        />
        {connectDropTarget(
          <div className={classNames(
            'container__layer', 'container__overlay', {
            'container__overlay--inactive':
              draggedItem && draggedItem.icon &&
              draggedItem.container !== name &&
              draggedItem.icon !== 'new-network-service',
            'container__overlay--active-not-first': (index !== 0) &&
              draggedItem && draggedItem.container === name &&
              draggedItem.icon !== 'new-network-service',
            'container__overlay--dragging':
              draggedItem && draggedItem.icon === 'new-network-service',
            'container__overlay--hovered': isOver
          })}
          />)}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container);
