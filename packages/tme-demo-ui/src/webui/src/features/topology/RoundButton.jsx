import React from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';

import * as IconTypes from '../../constants/Icons';
import * as Colours from '../../constants/Colours';

import Btn from '../icons/BtnWithTooltip';


export default forwardRef((props, ref) => {
  const { onClick, onMouseDown, pcX, pcY, type, size,
    active, expanded, disabled, tooltip } = props;
  const iconScale = type === IconTypes.BTN_DRAG ? 0.5 : 0.66;
  const actualSize = size * (active && !disabled ? 2 : 1);

  // It would be easier to inherit the background colour from the connection,
  // but this doesn't work well in Chrome with transitions
  return (
    <div
      className={classNames('topology__round-btn', {
        'topology__round-btn--add': type === IconTypes.BTN_ADD,
        'topology__round-btn--delete': type === IconTypes.BTN_DELETE,
        'topology__round-btn--hidden': type !== IconTypes.BTN_DRAG && !active,
        'topology__round-btn--enabled': active && !disabled,
        'topology__round-btn--disabled': active && disabled,
        'topology__round-btn--expanded': expanded
      })}
      ref={ref}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        borderRadius: `${actualSize / 2}px`,
        height: `${actualSize}px`,
        left: `${pcX}%`,
        top: `${pcY}%`,
        width: `${actualSize}px`
      }}
    >
      <div
        className="topology__round-btn-svg-container"
        style={{
          opacity: (active && !disabled) | 0,
          padding: actualSize * (1 - iconScale) / 2,
        }}
      >
       <Btn type={type} size={actualSize * iconScale} tooltip={tooltip}/>
      </div>
    </div>
  );
});
