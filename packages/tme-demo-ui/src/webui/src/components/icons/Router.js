import React from 'react';
import { STROKE, ROUTER } from '../../constants/Colours';

export default function({ size, colour }) {
  const background = colour ? colour : ROUTER;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 400 400"
      className="topology__svg-icon"
      width={`${size}px`}
      height={`${size}px`}
    >
      <symbol id="arrow" width="160" height="160">
        <path d="
          m80, 154
          c10,0 21,-2 23,-4
          c2,-1 3,-13 2,-24
          l-1,-19 15,-1
          c8,-1 16,-2 19,-5
          c5,-4 -35,-79 -51,-95
          c-5,-5 -9,-5 -14,0
          c-16,14 -56,91 -51,95
          c3,3 11,4 19,5
          l15,1 -1,19
          c-1,11 0,23 2,24
          c2,2 13,4 23,4"
        />
      </symbol>
      <circle
        className="topology__svg-icon-circle"
        stroke={STROKE} strokeWidth="10" fill={background}
        cx="200" cy="200" r="195"
      />
      <g fill="White">
        <use
          href="#arrow"
          transform="translate(50, 50) rotate(315, 80, 80)"
        />
        <use
          href="#arrow"
          transform="translate(190, 50) rotate(225, 80, 80)"
        />
        <use
          href="#arrow"
          transform="translate(190, 190) rotate(135, 80, 80)"
        />
        <use
          href="#arrow"
          transform="translate(50, 190) rotate(45, 80, 80)"
        />
      </g>
    </svg>
  );
}