import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

// The Elite VFX circle mark rebuilt as strokes (measured from public/brand/logo-mark-gold.png,
// 1000-unit canvas) so each line can draw on in turn. [x1, y1, x2, y2, width, start frame]
const LINES: [number, number, number, number, number, number][] = [
  [82, 499, 916, 499, 36, 4], // horizontal bar
  [218, 228, 776, 786, 27, 8], // long diagonal through the centre
  [334, 135, 698, 499, 27, 11], // upper diagonal
  [699, 499, 863, 663, 27, 13], // lower-right diagonal
  [489, 499, 489, 888, 36, 14], // lower vertical
  [715, 186, 715, 499, 26, 15], // thick upper vertical
];
// Thin hatching between the upper diagonal and the ring
const HATCH_X = [385, 421, 457, 493, 529.5, 565.5, 602, 638, 674];
const R = 399;

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const LogoMark: React.FC<{
  readonly size: number;
  readonly color: string;
  readonly delay?: number;
  readonly animate?: boolean;
  readonly style?: React.CSSProperties;
}> = ({size, color, delay = 0, animate = true, style}) => {
  const frame = useCurrentFrame();
  const draw = (start: number, length: number) =>
    animate
      ? interpolate(frame, [delay + start, delay + start + length], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        })
      : 1;
  const dash = (p: number) => ({strokeDasharray: 1, strokeDashoffset: 1 - p});

  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" style={style}>
      <g fill="none" stroke={color} strokeLinecap="butt">
        {/* Ring draws clockwise from the top */}
        <circle cx={499} cy={499} r={R} strokeWidth={36} pathLength={1} transform="rotate(-90 499 499)" style={dash(draw(0, 18))} />
        {LINES.map(([x1, y1, x2, y2, w, start]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} pathLength={1} style={dash(draw(start, 12))} />
        ))}
        {HATCH_X.map((x, i) => {
          const top = 499 - Math.sqrt(R * R - (x - 499) ** 2);
          return (
            <line key={x} x1={x} y1={x - 199} x2={x} y2={top} strokeWidth={8.5} pathLength={1} style={dash(draw(18 + i * 1.5, 8))} />
          );
        })}
      </g>
    </svg>
  );
};
