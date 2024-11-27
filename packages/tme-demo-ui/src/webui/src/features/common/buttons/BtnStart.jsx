import React from 'react';

export default React.forwardRef(({size}, ref) =>
  <svg
    ref={ref}
    className="round-btn__svg-icon"
    style={{height: `${size}px`, width: `${size}px`}}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120"
  >
    <g strokeWidth="20" stroke="currentColor" strokeLinecap="round">
      <line x1="20" y1="10" x2="20" y2="110" />
      <line x1="20" y1="110" x2="110" y2="60" />
      <line x1="110" y1="60" x2="20" y2="10" />
    </g>
  </svg>
);
