import React from 'react';
import { STROKE, GENERIC, BACKGROUND } from '../../../constants/Colours';

export default function({ size, colour }) {
  const background = colour ? colour : BACKGROUND;
  const foreground = colour ? 'White' : GENERIC;
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
      <g fill="none" stroke={foreground} strokeWidth="20" strokeLinecap="round">
        <line x1="120" y1="100" x2="120" y2="200" strokeWidth="40" />
        <path d="M160,70 C180,90 180,110 160,130" />
        <path d="M190,50 C220,80 220,120 190,150" />
        <path d="M220,30 C260,65 260,135 220,170" />
        <rect x="50" y="200" rx="20" ry="20" width="300" height="80" fill={background}/>
        <circle cx="200" cy="240" r="10" fill="LightYellow"/>
        <circle cx="250" cy="240" r="10" fill="LightYellow"/>
        <circle cx="300" cy="240" r="10" fill="LightYellow"/>
      </g>
    </svg>
  );
}
