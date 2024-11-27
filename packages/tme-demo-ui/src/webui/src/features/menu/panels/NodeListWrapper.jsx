import React from 'react';
import { useState, useCallback, useEffect, useRef, useImperativeHandle,
         Fragment, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { useDrag } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';

import { BTN_ADD } from 'constants/Icons';

import LoadingOverlay from 'features/common/LoadingOverlay';
import NewItem from 'features/common/NewItem';
import InlineBtn from 'features/common/buttons/InlineBtn';
import IconSvg from 'features/topology/icons/IconSvg';

import { bodyOverlayToggled } from 'features/nso/nsoSlice';
import { connectPngDragPreview } from 'features/topology/DragLayerCanvas';
import { useIconSize } from 'features/topology/LayoutContext';
import { itemDragged } from 'features/topology/topologySlice';

import { isFetching } from 'api/query';


const NodeListWrapper = forwardRef(function NodeListWrapper({
  title, label, keypath, level, fetching, disableCreate, newItemDefaults,
  newItemDragType, newItemDragIcon, defaultsPath,
  children
}, ref) {
  console.debug('NodeListWrapper Render');

  const [ newItemOpen, setNewItemOpen ] = useState(false);
  const [ minHeight, setMinHeight ] = useState(0);
  const [ itemDefaults, setItemDefaults ] = useState([]);

  const dispatch = useDispatch();
  const btnRef = useRef(null);
  const iconSize = useIconSize();

  useImperativeHandle(ref, () => ({
    openNewItem(defaults) {
      setItemDefaults(defaults);
      setNewItemOpen(true);
    }
  }), []);

  const openNewItem = () => {
    setNewItemOpen(true);

    dispatch(bodyOverlayToggled(true));
  };

  const closeNewItem = useCallback(() => {
    setNewItemOpen(false);
    dispatch(bodyOverlayToggled(false));
  }, []);

  const measuredRef = useCallback(node => {
    if (node !== null) {
      const height = isFetching(fetching) ? node.scrollHeight : 0;
      setTimeout(() => setMinHeight(height), height < minHeight ? 1000 : 0);
    }
  }, [ minHeight, fetching ]);

  const [ , drag, dragPreview ] = useDrag(() => ({
    type: newItemDragType || 'UNDEFINED',
    item: () => {
      dispatch(itemDragged({ icon: 'new-item' }));
      return ({ icon: 'new-item' });
    },
    end: (item, monitor) => {
      dispatch(itemDragged(undefined));
      if (monitor.didDrop()) {
        setNewItemOpen(true);
        setItemDefaults(monitor.getDropResult().itemDefaults);
      }
    },
    canDrag: newItemDragType !== undefined
  }));

  useEffect(() => {
    connectPngDragPreview(renderToStaticMarkup(
      <IconSvg type={newItemDragIcon} size={iconSize} />),
      iconSize, dragPreview, true);
  }, [ iconSize ]);

  return (
    <Fragment>
      {title &&
        <div className="header">
          <span className="header__title-text">{title}</span>
          {!disableCreate &&
            <Fragment>
              {drag(<div><InlineBtn
                ref={btnRef}
                icon={BTN_ADD}
                classSuffix="create"
                tooltip={`Add New ${label}`}
                onClick={openNewItem}
              /></div>)}
              <NewItem
                btnRef={btnRef}
                path={keypath}
                label={`${label} Name`}
                isOpen={newItemOpen}
                close={closeNewItem}
                defaults={itemDefaults}
                defaultsPath={defaultsPath}
              />
            </Fragment>
          }
        </div>
      }
      <div
        className="accordion__group"
        style={{minHeight: `${minHeight}px`,
        transition: `min-height ${minHeight === 0 ? 1000 : 0}ms`
      }}
      >
        {children}
        <LoadingOverlay items={fetching} ref={measuredRef}/>
      </div>
    </Fragment>
  );
});

export default NodeListWrapper;
