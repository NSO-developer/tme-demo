import React from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';

import * as IconTypes from 'constants/Icons';

import Btn from '../common/buttons/BtnWithTooltip';


const RoundButton = forwardRef(function RoundButton(props, ref) {
  const { onClick, onMouseDown, pcX, pcY, type, size,
    active, tooltip } = props;
  const iconScale = type === IconTypes.BTN_DRAG ? 0.5 : 0.66;
  const actualSize = size * (active ? 2 : 1);

  // It would be easier to inherit the background colour from the connection,
  // but this doesn't work well in Chrome with transitions
  return (
    <div
      className={classNames('topology__round-btn', {
        'btn--delete': type === IconTypes.BTN_DELETE,
        'btn--hidden': type !== IconTypes.BTN_DRAG && !active,
        'btn--active': active
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
          opacity: active | 0,
          padding: actualSize * (1 - iconScale) / 2,
        }}
      >
       <Btn type={type} size={actualSize * iconScale} tooltip={tooltip}/>
      </div>
    </div>
  );
});

export default RoundButton;
