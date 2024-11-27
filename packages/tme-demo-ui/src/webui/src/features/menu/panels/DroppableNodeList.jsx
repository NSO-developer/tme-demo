import React from 'react';
import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

import { ENDPOINT } from 'constants/ItemTypes';
import { CONFIGURATION_EDITOR_EDIT_URL } from 'constants/Layout';

import NodePane from './NodePane';
import NodeListWrapper from './NodeListWrapper';

import { pathKeyRegex, swapLabels, useQueryQuery } from 'api/query';
import { useCreateMutation } from 'api/data';
import { stopThenGoToUrl } from 'api/comet';

export const DROP_BEHAVIOUR_CREATE_ONLY = 0;
export const DROP_BEHAVIOUR_OPEN_NEW_ITEM = 1;
export const DROP_BEHAVIOUR_GOTO = 2;

function DroppableNodeList({
  label, keypath, noTitle,
  baseSelect, labelSelect, isLeafList, selector,
  allowDrop, accept, dropBehaviour,
  calculateName, newItemDefaults,
  newItemDragType, defaultsPath, newItemDragIcon,
  disableCreate, disableGoTo,
  ...rest
}) {
  console.debug('DrobbableNodeList Render');
  const dispatch = useDispatch();
  const [ openNode, setOpenNode ] = useState(null);
  const [ create ] = useCreateMutation();
  const createNode = useCallback(name => create({ name, keypath, ...rest }));
  const ref = useRef({});

  const { data } = useQueryQuery({
    xpathExpr: keypath.replace(pathKeyRegex, ''),
    selection: [ ...baseSelect, ...Object.keys(labelSelect || []) ],
    isLeafList
  }, { selectFromResult: selector });

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ENDPOINT,
    drop: async ({ type, name }) => {
      if (dropBehaviour !== DROP_BEHAVIOUR_OPEN_NEW_ITEM ) {
        const key = typeof calculateName === 'function'
          ? calculateName(name, data) : name;
        await createNode(key);
        if (dropBehaviour === DROP_BEHAVIOUR_GOTO) {
          dispatch(stopThenGoToUrl(
            `${CONFIGURATION_EDITOR_EDIT_URL}${keypath}{${key}}`));
        }
      } else {
        ref.current.openNewItem(
          typeof newItemDefaults === 'function'
            ? newItemDefaults(name)
            : newItemDefaults);
      }
    },
    canDrop: ({ type }, monitor) => {
      return allowDrop && type === accept;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [ data ]);

  const toggled = useCallback((keypath) => {
    setOpenNode(openNode => openNode === keypath ? null : keypath);
  }, [ keypath ]);

  return (
    <div className="drop-target__wrapper" ref={drop}>
      <NodeListWrapper
        title={!noTitle && `${label}s`}
        keypath={keypath}
        label={label}
        level={2}
        disableCreate={disableCreate}
        newItemDragType={newItemDragType}
        defaultsPath={defaultsPath}
        newItemDragIcon={newItemDragIcon}
        ref={ref}
     >
        {data?.map(({ name, keypath, ...item }) =>
          <NodePane
            title={name}
            key={name}
            keypath={keypath}
            label={label}
            level={2}
            isOpen={openNode === keypath}
            fade={!!openNode}
            nodeToggled={toggled}
            disableGoTo={disableGoTo}
            { ...swapLabels(item, labelSelect) }
          />
        )}
      </NodeListWrapper>
      <div className="drop-target">
        <div className={classNames('drop-target__overlay', {
          'drop-target__overlay--hovered': isOver && canDrop
        })}/>
      </div>
  </div>
  );
}

export default DroppableNodeList;
