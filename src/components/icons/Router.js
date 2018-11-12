import React from 'react';
import { STROKE } from '../../constants/Colours';

export default function(props) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1280 1280"
      preserveAspectRatio="xMidYMid meet"
      className="topology__svg-icon"
      width={`${props.size}px`}
      height={`${props.size}px`}
    >
      <circle
        cx="640"
        cy="640"
        r="620"
        stroke={STROKE}
        strokeWidth="40"
        fill={props.colour}
      />
      <g fill="white">
        <path d="M376 1013 l43 -48 35 34 c20 19 41 31 49 28 16 -6 78 -216 85 -291 l5 -49 -49 5 c-72 7 -285 70 -291 86 -3 7 10 29 28 48 l34 35 -48 43 c-26 24 -47 49 -47 56 0 16 84 100 100 100 7 0 32 -21 56 -47" />
        <path d="M1020 992 c0 -67 -75 -312 -95 -312 -8 0 -30 14 -49 30 l-34 31 -38 -46 c-21 -25 -46 -45 -55 -45 -22 0 -99 77 -99 99 0 9 20 34 45 55 l46 38 -31 34 c-16 19 -30 41 -30 49 0 21 235 93 308 94 29 1 32 -2 32 -27" />
        <path d="M589 589 c22 -23 41 -49 41 -58 0 -9 -20 -34 -45 -55 l-46 -38 31 -34 c16 -19 30 -41 30 -49 0 -20 -245 -95 -312 -95 -24 0 -28 4 -28 28 1 70 74 312 95 312 8 0 30 -14 49 -30 l34 -31 38 46 c21 25 46 45 55 45 9 0 35 -19 58 -41" />
        <path d="M903 550 c69 -19 121 -39 124 -47 3 -8 -9 -29 -28 -49 l-34 -35 48 -43 c26 -24 47 -49 47 -56 0 -16 -84 -100 -100 -100 -7 0 -32 21 -56 47 l-43 48 -35 -34 c-20 -19 -41 -31 -49 -28 -16 6 -78 216 -85 291 l-5 49 49 -5 c27 -3 102 -20 167 -38" />
      </g>
    </svg>
  );
}
