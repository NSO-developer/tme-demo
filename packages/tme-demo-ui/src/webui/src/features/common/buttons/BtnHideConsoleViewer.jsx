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
      <line x1="20" y1="20" x2="60" y2="60" />
      <line x1="60" y1="60" x2="100" y2="20" />
      <line x1="20" y1="60" x2="60" y2="100" />
      <line x1="60" y1="100" x2="100" y2="60" />
    </g>
  </svg>
);
