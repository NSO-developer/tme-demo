import React from 'react';
import { STROKE, WEB_SERVER } from '../../constants/Colours';

export default function({ size, colour }) {
  const background = colour ? colour : WEB_SERVER;
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
        stroke={STROKE} strokeWidth="10" fill={background}
        cx="200" cy="200" r="195"
      />
      <g stroke="White" strokeWidth="20" fill="none">
        <circle cx="200" cy="200" r="150" />
        <ellipse cx="200" cy="200" rx="80" ry="150" />
        <ellipse cx="200" cy="200" rx="150" ry="50" />
        <line x1="200" y1="50" x2="200" y2="350"/>
      </g>
    </svg>
  );
}
