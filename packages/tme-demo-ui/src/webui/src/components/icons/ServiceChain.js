import React from 'react';
import { STROKE, SERVICE_CHAIN } from '../../constants/Colours';

/* Symbols don't appear correctly when dragging in IE and Edge.
      <symbol id={`link-${background}`} width="160" height="160">
        <rect
          fill="White"
          x="0" y="5" rx="50" ry="50" width="160" height="150"
        />
        <rect
          fill={background}
          x="35" y="40" rx="25" ry="25" width="90" height="80"
        />
      </symbol>
*/

export default function({ size, colour }) {
  const background = colour ? colour : SERVICE_CHAIN;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 400 400"
      className="topology__svg-icon"
      width={`${size}px`}
      height={`${size}px`}
    >

      <circle
        className="topology__svg-icon-circle"
        stroke={STROKE} strokeWidth="10" fill={background}
        cx="200" cy="200" r="195"
      />
      <g transform="translate(185, 55) rotate(135, 80, 80)">
        <rect
          fill="White"
          x="0" y="5" rx="50" ry="50" width="160" height="150"
        />
        <rect
          fill={background}
          x="35" y="40" rx="25" ry="25" width="90" height="80"
        />
      </g>
      <g transform="translate(55, 185) rotate(135, 80, 80)">
        <rect
          fill="White"
          x="0" y="5" rx="50" ry="50" width="160" height="150"
        />
        <rect
          fill={background}
          x="35" y="40" rx="25" ry="25" width="90" height="80"
        />
      </g>
      <rect
        stroke={background} strokeWidth="10" fill="White"
        rx="20" ry="20" width="150" height="50"
        transform="translate(125, 175) rotate(135, 75, 25)"
      />
    </svg>
  );
}
