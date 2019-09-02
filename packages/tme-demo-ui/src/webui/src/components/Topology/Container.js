import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { DropTarget } from 'react-dnd';

import { NETWORK_SERVICE } from '../../constants/ItemTypes';

import BtnZoomIn from '../icons/BtnZoomIn';
import BtnZoomOut from '../icons/BtnZoomOut';

import { getDraggedItem, getDimensions, getLayout,
         getZoomedContainer } from '../../reducers';
import { newNetworkServiceToggled } from '../../actions/uiState';
import { containerZoomToggled } from '../../actions/layout';

import { pxCoordToSafePc } from '../../utils/UiUtils';


const mapStateToProps = state => ({
  draggedItem: getDraggedItem(state),
  dimensions: getDimensions(state),
  layout: getLayout(state),
  zoomedContainer: getZoomedContainer(state)
});

const mapDispatchToProps = { newNetworkServiceToggled, containerZoomToggled };

const dropTarget = {
  drop({ name, layout, dimensions, newNetworkServiceToggled }, monitor) {
    const containerName = layout[name].parentName || name;
    const { x, y } = monitor.getClientOffset();
    newNetworkServiceToggled(containerName,
      pxCoordToSafePc(x - dimensions.left, y - dimensions.top,
        layout[containerName], dimensions)
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
    let { name } = this.props;
    const { layout, draggedItem, connectDropTarget, isOver,
            zoomedContainer, containerZoomToggled } = this.props;
    const { index, title, parentName, pc } = layout[name];
    const width = pc.backgroundWidth;
    if (parentName) {
      name = parentName;
    }

    return (
      <div
        className="container"
        style={{ width: `${width}%` }}
      >
        <div
          className={classNames('container__layer', {
            'container__background': (index % 2 === 0),
            'container__background--alt': (index % 2 !== 0),
            'container__background--not-first': (index !== 0 && width > 0)
          })}
        >
          <div className="container__header">
            <div className="container__title">
              <span className="container__title-text">{title}</span>
              <div
                className="inline-round-btn inline-round-btn--zoom"
                onClick={() => containerZoomToggled(name)}
              >
                {zoomedContainer ? <BtnZoomOut/> : <BtnZoomIn/>}
              </div>
            </div>
          </div>
        </div>
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
