import React from 'react';
import { SWITCH_STROKE, SWITCH } from '../../constants/Colours';

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
          transform="translate(50, 90) rotate(270, 80, 80)"
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
          transform="translate(190, 30) rotate(90, 80, 80)"
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
          transform="translate(190, 150) rotate(90, 80, 80)"
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
          transform="translate(50, 210) rotate(270, 80, 80)"
        />
      </g>
    </svg>
  );
}
