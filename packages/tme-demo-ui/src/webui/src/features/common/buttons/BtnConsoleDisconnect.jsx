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
      <line x1="10" y1="50" x2="30" y2="10" />
      <line x1="30" y1="10" x2="50" y2="50" />
      <line x1="80" y1="10" x2="100" y2="10" />
      <line x1="100" y1="10" x2="100" y2="110" />
      <line x1="80" y1="110" x2="100" y2="110" />
    </g>
  </svg>
);
