import React from 'react';
import { STROKE, FIREWALL, BACKGROUND, FLAME } from '../../constants/Colours';

/* Symbols don't appear correctly when dragging in IE and Edge.
      <symbol id="flame">
        <path
          d="
            m340,232
            c-2,-48 10,-65,10,-65
            s-19,1 -41,13
            c-1,-19 3,-36 7,-48
            c-3,2 -14,7 -26,14
            c-6,-13 -8,-28 -1,-43
            c-56,40 -90,85 -90,122
            c0,28 7,72 75,72
            c41,0 61,-15 65,-45
            c1,-8 1,-14 1,-20"
        />
        <path
          d="
            m309,262
            c-7,10 -10,12 -38,13
            c-28,1 -34,-5 -39,-15
            c-15,-27 4,-45 3,-43
            c-1,2 -7,20 21,35
            c-14,-17 11,-37 20,-46
            c0,23 9,46 9,46
            s16,-10 27,-42
            c6,25 7,32 -3,52"
          fill={background}
        />
      </symbol>
*/

export default function({ size, colour }) {
  const background = colour ? colour : BACKGROUND;
  const foreground = colour ? 'White' : FIREWALL;
  const flame = colour ? 'White' : FLAME;
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
      <g fill={foreground}>
        <rect x="70" y="110" rx="10" ry="10" width="86" height="56"/>
        <rect x="70" y="176" rx="10" ry="10" width="182" height="56"/>
        <rect x="70" y="242" rx="10" ry="10" width="86" height="56"/>
        <rect x="166" y="110" rx="10" ry="10" width="120" height="56"/>
        <rect x="166" y="242" rx="10" ry="10" width="120" height="56"/>
      </g>
      <g strokeWidth="20" stroke={background}>
        <path
          d="
            m340,232
            c-2,-48 10,-65,10,-65
            s-19,1 -41,13
            c-1,-19 3,-36 7,-48
            c-3,2 -14,7 -26,14
            c-6,-13 -8,-28 -1,-43
            c-56,40 -90,85 -90,122
            c0,28 7,72 75,72
            c41,0 61,-15 65,-45
            c1,-8 1,-14 1,-20"
        />
        <path
          d="
            m309,262
            c-7,10 -10,12 -38,13
            c-28,1 -34,-5 -39,-15
            c-15,-27 4,-45 3,-43
            c-1,2 -7,20 21,35
            c-14,-17 11,-37 20,-46
            c0,23 9,46 9,46
            s16,-10 27,-42
            c6,25 7,32 -3,52"
          fill={background}
        />
      </g>
      <g fill={flame}>
        <path
          d="
            m340,232
            c-2,-48 10,-65,10,-65
            s-19,1 -41,13
            c-1,-19 3,-36 7,-48
            c-3,2 -14,7 -26,14
            c-6,-13 -8,-28 -1,-43
            c-56,40 -90,85 -90,122
            c0,28 7,72 75,72
            c41,0 61,-15 65,-45
            c1,-8 1,-14 1,-20"
        />
        <path
          d="
            m309,262
            c-7,10 -10,12 -38,13
            c-28,1 -34,-5 -39,-15
            c-15,-27 4,-45 3,-43
            c-1,2 -7,20 21,35
            c-14,-17 11,-37 20,-46
            c0,23 9,46 9,46
            s16,-10 27,-42
            c6,25 7,32 -3,52"
          fill={background}
        />
      </g>
    </svg>
  );
}
