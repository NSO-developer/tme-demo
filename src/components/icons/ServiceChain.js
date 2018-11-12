import React from 'react';
import { STROKE, SERVICE_CHAIN } from '../../constants/Colours';

export default function(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 440 440"
      className="topology__svg-icon"
      width={`${props.size}px`}
      height={`${props.size}px`}
    >
      <circle
        cx="220"
        cy="220"
        r="212"
        stroke={STROKE}
        strokeWidth="16"
        fill={SERVICE_CHAIN}
      />
      <g fill="white">
        <path d="M365 117 l-41 -40 c-18 -18 -47 -18 -65 0 l-45 44 c-18 18 -18 46 0 64 l26 -25 c-3 -8 1 -17 7 -23 l29 -28c 9 -9 24 -9 33 0 l25 24 c9 9 9 23 0 32 l-29 28 c-6 6 -16 9 -24 7 l-25 25 c18 18 47 18 65 0 l45 -44 C383 164 383 135 365 117z" />
        <path d="M200 279 c2 8 1 18 -8 24 l-27 26 c-9 9 -24 9 -33 0 l-25 -25 c-9 -9 -9 -24 0 -33 l27 -26 c7 -6 16 -10 24 -7 l26 -26 c-18 -18 -48 -18 -67 0 l-44 43 c-19 18 -19 47 0 65 l42 41 c18 18 48 18 67 0 l44 -43 c18 -18 19 -47 0 -65 L200 279z" />
        <path d="M171 267 c6 6 16 6 22 0 l75 -74 c6 -6 6 -16 0 -22 c-6 -6 -16 -6 -22 -0 l-75 74 C165 251 165 261 171 267z" />
      </g>
    </svg>
  );
}
