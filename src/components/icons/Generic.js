import React from 'react';
import { STROKE, GENERIC, BACKGROUND } from '../../constants/Colours';

export default function({ size, colour }) {
  const background = colour ? colour : BACKGROUND;
  const foreground = colour ? 'White' : GENERIC;
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
      <g stroke={foreground} strokeWidth="30" fill="none">
        <rect x="100" y="100" rx="5" ry="5" width="200" height="150"/>
        <line x1="170" y1="275" x2="230" y2="275"/>
      </g>
      <rect
        fill={foreground}
        x="130" y="300" width="140" height="30" rx="15" ry="15"
      />
      <line
        stroke={foreground} strokeWidth="15"
        x1="130" y1="323" x2="270" y2="323"
      />
    </svg>
  );
}
