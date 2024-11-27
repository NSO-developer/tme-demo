import React from 'react';
import { memo,
         useRef, useContext, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import classNames from 'classnames';

import { CONFIGURATION_EDITOR_EDIT_URL } from 'constants/Layout';
import { BTN_DRAG, BTN_DELETE, BTN_GOTO } from 'constants/Icons';
import { CIRCLE_ICON_RATIO, LINE_ICON_RATIO } from 'constants/Layout.js';

import Interface from './Interface';
import RoundButton from './RoundButton';

import { getDraggedItem, getSelectedConnection, getEditMode,
         connectionSelected } from './topologySlice';

import { useDeviceIconPosition } from './Icon';
import { useNsInfoVmDevices } from './Vnf';

import { LayoutContext } from './LayoutContext';

import { stopThenGoToUrl } from 'api/comet';
import { useQueryQuery } from 'api/query';
import { useDeletePathMutation } from 'api/data';


export const createConnection = async (
  endpoint1Device, endpoint2Device, create, setValue
) => {
  const name = `${endpoint1Device}-${endpoint2Device}`;
  const path = '/l3vpn:topology/connection';
  const keypath = `${path}{${name}}`;

  await create({ keypath: path, name, endpoint1Device, endpoint2Device });
  setValue({ keypath, leaf: 'endpoint-1/device', value: endpoint1Device });
  setValue({ keypath, leaf: 'endpoint-2/device', value: endpoint2Device });
};


// === Queries ================================================================

export function useConnectionsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/l3vpn:topology/connection',
    selection: [ 'name', 'endpoint-1/device', 'endpoint-2/device' ],
    subscribe: { cdbOper: false, skipLocal: false }
  }, { selectFromResult });
}

function getConnectedDevices(device, connections) {
  return connections?.reduce(
    (accumulator, { name, endpoint1Device, endpoint2Device }) => {
      if (device === endpoint1Device || device === endpoint2Device) {
        accumulator.push(device === endpoint1Device ? endpoint2Device : endpoint1Device);
      }
      return accumulator;
    }, []
  ) || [];
}

export function useConnectedDevices(name) {
  const selector = useMemo(() => createSelector(
    result => JSON.stringify(getConnectedDevices(name, result.data)),
    devices => ({ data: JSON.parse(devices) })
  ), [ name ]);

  return useConnectionsQuery(selector).data;
}

export function useNsInfoConnectedDevices(nsInfo) {
  const nsInfoDevices = useNsInfoVmDevices(nsInfo).data?.map(
    ({ deviceName }) => deviceName);

  const selector = useMemo(() => createSelector(
    result => nsInfoDevices?.length > 0 && JSON.stringify(nsInfoDevices.flatMap(
      device => getConnectedDevices(device, result.data))),
    devices => ({ data: devices && JSON.parse(devices) })
  ), [ nsInfo, nsInfoDevices ]);

  return useConnectionsQuery(selector).data;
}


// === Utils ==================================================================

export function pointAlongLine(x1, y1, x2, y2, n) {
  const d = lineLength({ x1, y1, x2, y2 });
  if (d > n) {
    const r = n / d;
    const x = r * x2 + (1 - r) * x1;
    const y = r * y2 + (1 - r) * y1;
    return { x, y };
  } else {
    return { x: x2, y: y2 };
  }
}

function lineLength({ x1, y1, x2, y2 }) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function lineAngle({ x1, y1, x2, y2 }) {
  const theta = Math.atan2(y2 - y1, x2 - x1);
  const angle = theta * 180 / Math.PI;
  if (angle < 0) {
    return angle + 360;
  } else {
    return angle;
  }
}


// === Component ==============================================================

const Connection = memo(function Connection({
    keypath, aEndDevice, zEndDevice, igp, te, delay }) {
  console.debug('Connection Render ', keypath);

  const dispatch = useDispatch();
  const [ deletePath ] = useDeletePathMutation();

  const layout = useContext(LayoutContext);

  const editMode = useSelector((state) => getEditMode(state));
  const dragging = useSelector((state) => {
    const draggedItem = getDraggedItem(state);
    return !!draggedItem &&
      (draggedItem.keypath === keypath ||
       draggedItem.icon === aEndDevice ||
        draggedItem.icon === zEndDevice);
  });
  const selected = useSelector((state) => {
    const selectedConnection = getSelectedConnection(state);
    return Boolean(editMode && selectedConnection
      && selectedConnection.aEndDevice === aEndDevice
      && selectedConnection.zEndDevice === zEndDevice);
  });

  const connSelected = () => {
    editMode && dispatch(connectionSelected({ aEndDevice, zEndDevice }));
  };

  const deleteConn = useCallback(() => {
    deletePath({ keypath });
  }, []);

  const goToConn = useCallback((event) => {
    event.stopPropagation();
    dispatch(stopThenGoToUrl(CONFIGURATION_EDITOR_EDIT_URL + keypath));
  }, []);

  const { x: x1, y: y1, ...aEndIcon } = useDeviceIconPosition(aEndDevice);
  const { x: x2, y: y2, ...zEndIcon } = useDeviceIconPosition(zEndDevice);
  const expanded = aEndIcon.expanded || zEndIcon.expanded;
  const hidden = aEndIcon.hidden || zEndIcon.hidden;
  const colour = aEndIcon.connectionColour || zEndIcon.connectionColour;
  const { iconSize, dimensions } = layout;
  const iconRadius = iconSize / 2;
  const circleSize = iconSize * CIRCLE_ICON_RATIO;
  const lineWidth = iconSize * LINE_ICON_RATIO;
  const p1 = pointAlongLine(x1, y1, x2, y2, iconRadius);
  const p2 = pointAlongLine(x2, y2, x1, y1, iconRadius);
  const line = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  const length = lineLength(line);
  const p3 = pointAlongLine(p1.x, p1.y, p2.x, p2.y, length / 2);
  const pcP1 = layout.pxToPc(p1);

  const lineAngleRef = useRef(0);
  let actualLineAngle = lineAngleRef.current;

  if (length > 0) {
    actualLineAngle = lineAngle(line);
    // Always apply the shortest rotation
    if ((lineAngleRef.current - actualLineAngle) > 180) {
      actualLineAngle += 360;
    } else if ((lineAngleRef.current - actualLineAngle) < -180) {
      actualLineAngle -= 360;
    }
  }
  useEffect(() => {
    lineAngleRef.current = actualLineAngle;
  }, [ x1, y1, x2, y2 ]);

  return (
    <div
      id={`${aEndDevice} - ${zEndDevice}`}
      onClick={connSelected}
      className={classNames('topology__connection', {
        'topology__connection--selected': selected || expanded,
        'topology__connection--edit': editMode,
        'topology__connection--dragging': dragging,
        'topology__connection--hidden': hidden
      })}
      style={{
        background: !selected && !expanded ? colour : null,
        height: `${lineWidth}px`,
        left: `${pcP1.pcX}%`,
        top: `${pcP1.pcY}%`,
        transform: `rotate(${actualLineAngle}deg) translate(0, -50%)`,
        width: `${length / dimensions.width * 100}%`
      }}
    >
      <Interface
        keypath={keypath}
        aEndDevice={aEndDevice}
        fromDevice={zEndDevice}
        pcX="0"
        pcY="50"
        {...p1}
        size={circleSize}
        active={selected}
        type={BTN_DRAG}
        tooltip="Move Connection (drag me)"
      />
      <Interface
        keypath={keypath}
        zEndDevice={zEndDevice}
        fromDevice={aEndDevice}
        pcX="100"
        pcY="50"
        {...p2}
        size={circleSize}
        active={selected}
        type={BTN_DRAG}
        tooltip="Move Connection (drag me)"
      />
      <RoundButton
        onClick={deleteConn}
        pcX="50"
        pcY="50"
        {...p3}
        hide={!selected}
        size={circleSize}
        active={selected}
        type={BTN_DELETE}
        tooltip="Delete Connection"
      />
      <RoundButton
        onClick={goToConn}
        pcX="50"
        pcY="50"
        {...p3}
        hide={!expanded}
        size={circleSize}
        active={expanded}
        type={BTN_GOTO}
        tooltip="View Connection in Configuration Editor"
      />
    </div>
  );
});

export default Connection;
