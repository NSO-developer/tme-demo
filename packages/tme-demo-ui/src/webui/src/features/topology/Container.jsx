import React from 'react';
import { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { NETWORK_SERVICE } from '../../constants/ItemTypes';

import * as IconTypes from 'constants/Icons';

import InlineBtn from '../common/buttons/InlineBtn';

import { getDraggedItem, getVisibleUnderlays, getZoomedContainer,
         underlayToggled, containerZoomToggled } from './topologySlice';
import { LayoutContext } from './LayoutContext';

import { getOpenServiceName } from '../menu/menuSlice';

const getNetworkServiceDefaults = (tenant, container, pos) => [
    { path: 'ns-info', value: `${tenant}-`, prefix: true },
    { path: 'type', value: IconTypes.SERVICE_CHAIN },
    { path: 'container', value: container },
    { path: 'coord/x', value: pos.x },
    { path: 'coord/y', value: pos.y }
];

function Container(props) {
  console.debug('Container Render');

  const dispatch = useDispatch();
  const layout = useContext(LayoutContext);

  const container = layout.containers[props.name];

  const { parentName, index, title,
          pc : { backgroundWidth: width } } = container;
  const name = parentName || props.name;

  const zoomedContainer = useSelector((state) => getZoomedContainer(state));
  const draggedItem = useSelector((state) => getDraggedItem(state));
  const openServiceName = useSelector((state) => getOpenServiceName(state));
  const underlayVisible = useSelector(
    (state) => getVisibleUnderlays(state).includes(name));

  const [ collectedProps, drop ] = useDrop(() => ({
    accept: NETWORK_SERVICE,
    drop: (item, monitor) => {
      const { x, y } = monitor.getClientOffset();
      return ({ itemDefaults: getNetworkServiceDefaults(
        openServiceName, name, layout.pxToPc({
          x: x - layout.dimensions.left,
          y: y - layout.dimensions.top
        }, name)) });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [ layout ]);

  const { isOver } = collectedProps;

  return (
    <div
      className="container"
      style={{ width: `${width}%` }}
    >
      <div
        className={classNames('component__layer', {
          'container__background': (index % 2 === 0),
          'container__background-alt': (index % 2 !== 0),
          'container__background-not-first': (index !== 0 && width > 0)
        })}
      >
        <div className="header">
            <span className="header__title-text">{title}</span>
            <InlineBtn
              icon={IconTypes.BTN_SHOW_UNDERLAY}
              hidden={underlayVisible}
              tooltip={'Show underlay devices'}
              onClick={() => dispatch(underlayToggled(name))}
            />
            <InlineBtn
              icon={IconTypes.BTN_HIDE_UNDERLAY}
              hidden={!underlayVisible}
              tooltip={'Hide underlay devices'}
              onClick={() => dispatch(underlayToggled(name))}
            />
            <InlineBtn
              icon={IconTypes.BTN_ZOOM_IN}
              hidden={zoomedContainer}
              tooltip={'Zoom in'}
              onClick={() => dispatch(containerZoomToggled(name))}
            />
            <InlineBtn
              icon={IconTypes.BTN_ZOOM_OUT}
              hidden={!zoomedContainer}
              tooltip={'Zoom out'}
              onClick={() => dispatch(containerZoomToggled(name))}
            />
          </div>
      </div>
      {drop(<div className={classNames(
        'component__layer', 'container__overlay', {
        'container__overlay--inactive':
          draggedItem?.container && draggedItem?.container !== name,
        'container__overlay--dragging':
          draggedItem && draggedItem?.icon === 'new-item',
        'container__overlay--hovered': isOver
      })}/>)}
    </div>
  );
}

export default Container;
