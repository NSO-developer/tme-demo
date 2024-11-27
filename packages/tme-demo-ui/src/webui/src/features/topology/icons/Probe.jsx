import React from 'react';
import { SWITCH_STROKE, SWITCH } from '../../../constants/Colours';

export default function ({ size, colour }) {
  const background = colour ? colour : SWITCH;
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
        stroke={SWITCH_STROKE} strokeWidth="10" fill={background}
        cx="200" cy="200" r="195"
      />
      <g fill="White">
        <path d="
          M100,300
          A140,140 0 1 1 300,300
          A20,20 0 0 1 280,300
          L260,280
          A20,20 0 0 1 260,260
          A100,100, 0 1 0 120,280
          A10,10 0 0 1 100,300" />
      </g>
      <g fill={SWITCH_STROKE} stroke="White" strokeWidth="10">
        <path d="
          M270,110
          L160,200
          A20,20 0 0 0 200,240
          L290,130
          A10,10 0 0 0 270,110" />
      </g>
    </svg>
  );
}
