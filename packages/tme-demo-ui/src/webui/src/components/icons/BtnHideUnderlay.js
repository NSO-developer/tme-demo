import React from 'react';

export default function({size}) {
  return (
    <svg
      className="round-btn__svg-icon"
      style={{height: `${size}px`, width: `${size}px`}}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
    >
      <g stroke="currentColor" fill="currentColor">
        <g strokeWidth="10">
          <circle cx="55" cy="140" r="50" />
          <circle cx="200" cy="140" r="50" />
          <circle cx="345" cy="140" r="50" />
        </g>
        <g strokeWidth="50">
          <line x1="55" y1="220" x2="55" y2="290" />
          <line x1="200" y1="220" x2="200" y2="290" />
          <line x1="345" y1="220" x2="345" y2="290" />
          <line x1="55" y1="290" x2="345" y2="290" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}
