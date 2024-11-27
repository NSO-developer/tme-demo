import React from 'react';
import { STROKE, LOAD_BALANCER, BACKGROUND } from '../../constants/Colours';

/* Symbols don't appear correctly when dragging in IE and Edge.
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
*/

export default function({ size, colour }) {
  const background = colour ? colour : BACKGROUND;
  const foreground = colour ? 'White' : LOAD_BALANCER;
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
      <g fill={foreground}>
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
          href="#arrow"
          transform="translate(120, 20) rotate(45, 80, 180)"
        />
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
          transform="translate(120, 20) rotate(135, 80, 180)"
        />
        <circle cx="80" cy="200" r="30"/>
      </g>
      <g stroke={foreground} strokeWidth="30">
        <circle fill="none" cx="200" cy="200" r="40" />
        <line x1="80" y1="200" x2="150" y2="200"/>
        <line x1="80" y1="100" x2="80" y2="160"/>
        <line x1="80" y1="240" x2="80" y2="300"/>
      </g>
    </svg>
  );
}
