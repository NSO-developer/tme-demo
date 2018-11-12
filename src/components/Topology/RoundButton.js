import React from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';

import * as IconTypes from '../../constants/Icons';
import * as Colours from '../../constants/Colours';

import BtnAddIcon from '../icons/BtnAdd';
import BtnDeleteIcon from '../icons/BtnDelete';
import BtnDragIcon from '../icons/BtnDrag';


export default forwardRef((props, ref) => {
  const { onClick, pcX, pcY, type, size, active, disabled } = props;
  const iconScale = type === IconTypes.BTN_DRAG ? 0.5 : 0.66;
  const actualSize = size * (active && !disabled ? 2 : 1);

  return (
    <div
      className={classNames('topology__round-btn', {
        'topology__round-btn--add': type === IconTypes.BTN_ADD,
        'topology__round-btn--delete': type === IconTypes.BTN_DELETE,
        'topology__round-btn--hidden': type !== IconTypes.BTN_DRAG && !active,
        'topology__round-btn--enabled': active && !disabled,
        'topology__round-btn--disbled': !active || disabled
      })}
      ref={ref}
      onClick={onClick}
      style={{
        borderRadius: `${actualSize / 2}px`,
        height: `${actualSize}px`,
        left: `${pcX}%`,
        top: `${pcY}%`,
        width: `${actualSize}px`
      }}
    >
      <div
        style={{
          opacity: (active && !disabled) | 0,
          padding: actualSize * (1 - iconScale) / 2,
          transition: active && 'opacity 250ms 100ms',
        }}
      >
       {type === IconTypes.BTN_ADD &&
         <BtnAddIcon size={actualSize * iconScale}/>
       }
       {type === IconTypes.BTN_DELETE &&
         <BtnDeleteIcon size={actualSize * iconScale}/>
       }
       {type === IconTypes.BTN_DRAG &&
         <BtnDragIcon size={actualSize * iconScale}/>
       }
      </div>
    </div>
  );
});
