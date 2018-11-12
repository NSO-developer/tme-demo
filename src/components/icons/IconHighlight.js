import React from 'react';
import { HIGHLIGHT } from '../../constants/Colours';

export default function(props) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid meet"
      width={`${props.size}px`}
      height={`${props.size}px`}
    >
      <defs>
        <filter id="blur" x="-20" y="-20" height="120" width="120">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="40"
        fill={HIGHLIGHT}
        filter="url(#blur)"
      />
    </svg>
  );
}

