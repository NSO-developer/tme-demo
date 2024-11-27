import React from 'react';

export default React.forwardRef(({size}, ref) =>
  <svg
    width="32"
    height="32"
    style={{height: `${size}px`, width: `${size}px`}}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.76256 12.2626C8.44598 11.5791 9.55402 11.5791 10.2374 12.2626L16 18.0251L21.7626 12.2626C22.446 11.5791 23.554 11.5791 24.2374 12.2626C24.9209 12.946 24.9209 14.054 24.2374 14.7374L17.2374 21.7374C16.554 22.4209 15.446 22.4209 14.7626 21.7374L7.76256 14.7374C7.07915 14.054 7.07915 12.946 7.76256 12.2626Z"
      fill="var(--path-color-default, var(--path-color-0, currentColor))">
    </path>
  </svg>
);
