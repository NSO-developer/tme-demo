import React from 'react';
import { useSelector } from 'react-redux';

import DragLayerDrawer from './DragLayerDrawer';

import { useIcon, useIconsQuery } from './Icon';
import { useNsInfoConnectedDevices, useConnectedDevices } from './Connection';

import { getDraggedItem, getHoveredIcon } from './topologySlice';
import { useIconPositionCalculator } from './Icon';

import { useVmDevicesQuery } from './Vnf';

function CustomDragLayer({ canvasRef }) {
  console.debug('CustomDragLayer Render');

  const iconPosition = useIconPositionCalculator();
  const draggedItem = useSelector((state) => getDraggedItem(state)) || {};
  const { device, nsInfo, fromDevice } = draggedItem;

  const nsInfoConnectedDevices = useNsInfoConnectedDevices(nsInfo);
  const connectedDevices = useConnectedDevices(device);

  const fromDevices = fromDevice ? [ fromDevice ] : (
    nsInfoConnectedDevices || connectedDevices);
  const hoveredIcon = useIcon(useSelector((state) => getHoveredIcon(state)));

  const vmDevices = useVmDevicesQuery().data;
  const icons = useIconsQuery().data;

  const getIcon = (deviceName) => {
    const nsInfoName = vmDevices?.find(
      vmDevice => vmDevice.deviceName === deviceName
    )?.parentParentId?.replace(/.*ns-info-/, '');

    return icons?.find(
      icon => icon.device === deviceName || icon.nsInfo === nsInfoName);
  };

  return (
    <DragLayerDrawer
      canvasRef={canvasRef}
      fromIcons={fromDevices?.map(device => iconPosition(getIcon(device)))}
      toIcon={hoveredIcon && iconPosition(hoveredIcon)}
    />
  );
}

export default CustomDragLayer;
