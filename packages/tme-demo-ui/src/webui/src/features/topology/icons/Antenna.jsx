import React from 'react';
import { ANTENNA, ANTENNA_STROKE } from '../../constants/Colours';

export default function({ size, colour }) {
  const background = colour ? colour : ANTENNA;
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
        stroke={ANTENNA_STROKE} strokeWidth="10" fill={background}
        cx="200" cy="200" r="195"
      />
      <g fill="none" stroke="White" strokeWidth="20">
        <path d="M130,60 C60,110 60,210 130,260" />
        <path d="M155,95 C110,125 110,195 155,225" />
        <path d="M270,60 C340,110 340,210 270,260" />
        <path d="M245,95 C290,125 290,195 245,225" />
      </g>
      <g stroke="none">
        <path d="M180,160 L170,350 C180,370 220,370 230,350 L220,160 L180,160"
              fill="DarkSlateGrey" />
        <circle cx="200" cy="160" r="40" fill="LightYellow"/>
      </g>
    </svg>
  );
}
