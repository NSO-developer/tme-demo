import React from 'react';
import { createContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getIconSize, getDimensions, getZoomedContainer } from './topologySlice';
import { useQueryQuery } from 'api/query';


export const LayoutContext = createContext();

const safeRound = (n) =>
  Math.min(1, Math.max(0, Number.parseFloat(n).toFixed(4))).toString();

export const useIconSize = () => {
  const iconSize = useSelector((state) => getIconSize(state));
  const dimensions = useSelector((state) => getDimensions(state));
  const { width, height } = dimensions || {};
  return width > height ? iconSize*height/100 : iconSize*width/100;
};

export function useLayoutsQuery() {
  return useQueryQuery({
    xpathExpr: '/webui:webui/webui:data-stores/tme-demo-ui:topology-layout',
    selection: [
      'name',
      'width',
      'title',
      'connection-colour' ]
  });
}

export function useZoomedLayoutsQuery() {
  return useQueryQuery({
    xpathExpr: '/webui:webui/webui:data-stores/tme-demo-ui:topology-layout/tme-demo-ui:zoomed',
    selection: [
      '../name',
      'title',
      'width' ]
  });
}

export function getZoomedLayout(zoomedLayouts, name) {
  return zoomedLayouts?.filter(
    ({ parentName }) => parentName == name
  ).map(
    (zoomedLayout, index) => ({
      name: `${zoomedLayout.parentName}-${index}`,
      index,
      ...zoomedLayout
    })
  );
}

const calculateLayout = (
  basicLayout, dimensions, iconHeightPc, iconWidthPc,
  zoomedContainerName, backgroundOffsetPc, zoomedLayouts
) => {
  console.debug('Reselect layout');
  if (!basicLayout || !dimensions) {
    return undefined;
  }
  let afterZoomed = false;
  let x = -iconWidthPc / 2;
  return basicLayout.reduce((accumulator,
    { name, title, connectionColour, width }, index) => {
    const offset = backgroundOffsetPc / ((
      index === 0 || index === (basicLayout.length - 1)) ? 4 : 2);
    const zoomed = zoomedContainerName === name;
    const zoomedLayout = getZoomedLayout(zoomedLayouts, name);
    if (zoomed) {
      afterZoomed = true;
    }
    width = Number(width);
    const pc = zoomedContainerName ? {
      left: zoomed ? iconWidthPc / 2 : afterZoomed ? 100 : 0,
      right: zoomed ? 100 - iconWidthPc / 2 : afterZoomed ? 100 : 0,
      top: iconHeightPc / 2,
      bottom: 100 - iconHeightPc,
      width: zoomed ? 100 - iconWidthPc : 0,
      height: 100 - iconHeightPc * 1.5,
      backgroundWidth: zoomed && zoomedLayout.length == 0 ? 100 : 0
    } : {
      left: x += iconWidthPc,
      right: x += width - iconWidthPc,
      top: iconHeightPc / 2,
      bottom: 100 - iconHeightPc,
      width: width - iconWidthPc,
      height: 100 - iconHeightPc * 1.5,
      backgroundWidth: (index % 2) ? width + offset : width - offset
    };
    accumulator[name] = {
      name, index, title, connectionColour, pc,
      px: {
        left: Math.round(pc.left * dimensions.width / 100),
        right: Math.round(pc.right * dimensions.width / 100),
        top: Math.round(pc.top * dimensions.height / 100),
        bottom: Math.round(pc.bottom * dimensions.height / 100)
      }
    };
    zoomedLayout?.forEach(( container, index ) => {
      accumulator[container.name] = {
        index, parentName: name,
        title: container.title,
        pc: {
          backgroundWidth: zoomed ?container.width : 0
        }
      };
    });
    return accumulator;
  }, {});
};

export const LayoutContextProvider = React.memo(function Context({ children }) {
  console.debug('LayoutContext Render');
  const zoomedContainerName = useSelector((state) => getZoomedContainer(state));
  const dimensions = useSelector((state) => getDimensions(state));
  const iconSize = useSelector((state) => getIconSize(state));

  const { data } = useLayoutsQuery();
  const zoomedLayouts = useZoomedLayoutsQuery().data;
  const backgroundOffset = 'even';

  const context = useMemo(() => {
    const { width, height } = dimensions || {};

    const iconHeightPc = height > width ? iconSize*width/height : iconSize;
    const iconWidthPc = width > height ? iconSize*height/width : iconSize;

    const backgroundOffsetPc = 0 +
      (backgroundOffset === 'odd' ? iconWidthPc : 0) -
      (backgroundOffset === 'even' ? iconWidthPc : 0);

    const containers = calculateLayout(
      data, dimensions, iconHeightPc, iconWidthPc,
      zoomedContainerName, backgroundOffsetPc, zoomedLayouts);

    const pxToScreenPc = ({ x, y }) => ({
      pcX: x / width * 100,
      pcY: y / height * 100
    });

    const restrictPos = ({ x, y }, containerName) => {
      const { left, right, top, bottom } = containers[containerName].px;
      return {
        x: Math.max(left, Math.min(right, x)),
        y: Math.max(top, Math.min(bottom, y))
      };
    };

    return {
      dimensions, iconHeightPc, iconWidthPc, restrictPos, containers,
      iconSize: width > height ? iconSize*height/100 : iconSize*width/100,
      pxToPc: (coord, containerName) => {
        if (containerName) {
          const { left, top, width, height } = containers[containerName].pc;
          const { pcX, pcY } = pxToScreenPc(restrictPos(coord, containerName));
          return { x: safeRound((pcX - left) / width),
                   y: safeRound((pcY - top) / height) };
        }
        return pxToScreenPc(coord);
      }
    };
  }, [ data, iconSize, dimensions, zoomedContainerName ]);

  return (
    <LayoutContext.Provider value={context}>
      {children}
    </LayoutContext.Provider>
  );
});
