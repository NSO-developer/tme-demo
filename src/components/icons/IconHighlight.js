import React from 'react';

export default function({ size, colour }) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid meet"
      width={`${size}px`}
      height={`${size}px`}
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
        fill={colour}
        filter="url(#blur)"
      />
    </svg>
  );
}

