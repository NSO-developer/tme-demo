import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { DropTarget } from 'react-dnd';

import { NETWORK_SERVICE } from '../../constants/ItemTypes';
import * as IconTypes from '../../constants/Icons';

import Btn from '../icons/BtnWithTooltip';

import { getDraggedItem, getDimensions, getLayout,
         getZoomedContainer, getVisibleUnderlays } from '../../reducers';
import { newNetworkServiceToggled,
         underlayToggled } from '../../actions/uiState';
import { containerZoomToggled } from '../../actions/layout';

import { pxCoordToSafePc } from '../../utils/UiUtils';


const mapStateToProps = (state, props) => {
  const layout = getLayout(state)[props.name];
  const name = layout.parentName || props.name;
  return {
    name,
    draggedItem: getDraggedItem(state),
    dimensions: getDimensions(state),
    layout,
    zoomedContainer: getZoomedContainer(state),
    underlayVisible: getVisibleUnderlays(state).includes(name)
  };
};

const mapDispatchToProps = { newNetworkServiceToggled,
                             underlayToggled, containerZoomToggled };

const dropTarget = {
  drop({ name, layout, dimensions, newNetworkServiceToggled }, monitor) {
    const { x, y } = monitor.getClientOffset();
    newNetworkServiceToggled(name,
      pxCoordToSafePc(x - dimensions.left, y - dimensions.top,
        layout, dimensions)
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
    const { name, layout, draggedItem, connectDropTarget, isOver,
            zoomedContainer, underlayToggled, containerZoomToggled,
            underlayVisible } = this.props;
    const { index, title, pc } = layout;
    const width = pc.backgroundWidth;

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
                className={classNames('inline-round-btn',
                  'inline-round-btn--toggle-underlay', {
                  'inline-round-btn--hidden': underlayVisible
                })}
                onClick={() => underlayToggled(name)}
              >
                <Btn
                  type={IconTypes.BTN_SHOW_UNDERLAY}
                  tooltip="Show underlay devices"
                />
              </div>
              <div
                className={classNames('inline-round-btn',
                  'inline-round-btn--toggle-underlay', {
                  'inline-round-btn--hidden': !underlayVisible
                })}
                onClick={() => underlayToggled(name)}
              >
                <Btn
                  type={IconTypes.BTN_HIDE_UNDERLAY}
                  tooltip="Hide underlay devices"
                />
              </div>
              <div
                className={classNames('inline-round-btn',
                  'inline-round-btn--zoom', {
                  'inline-round-btn--hidden': zoomedContainer
                })}
                onClick={() => containerZoomToggled(name)}
              >
                <Btn type={IconTypes.BTN_ZOOM_IN} tooltip="Zoom in"/>
              </div>
              <div
                className={classNames('inline-round-btn',
                  'inline-round-btn--zoom', {
                  'inline-round-btn--hidden': !zoomedContainer
                })}
                onClick={() => containerZoomToggled(name)}
              >
                <Btn type={IconTypes.BTN_ZOOM_OUT} tooltip="Zoom out"/>
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
