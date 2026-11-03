import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Fades and lifts its children in at `delay` frames and out before the sequence ends.
export const Reveal: React.FC<{
  readonly delay?: number;
  readonly exit?: boolean;
  readonly rise?: number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({delay = 0, exit = true, rise = 24, style, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity =
    interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) *
    (exit
      ? interpolate(frame, [durationInFrames - 8, durationInFrames - 1], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1);
  return (
    <div
      style={{
        ...style,
        opacity,
        translate: interpolate(frame, [delay, delay + 18], [`0px ${rise}px`, '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        }),
      }}
    >
      {children}
    </div>
  );
};

// Word-by-word rise with a short blur, for headline lines.
export const Words: React.FC<{
  readonly text: string;
  readonly delay?: number;
  readonly stagger?: number;
  readonly style?: React.CSSProperties;
}> = ({text, delay = 0, stagger = 3, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 0.26em', ...style}}>
      {text.split(' ').map((word, i) => {
        const start = delay + i * stagger;
        const p = interpolate(frame, [start, start + 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });
        return (
          <span
            key={i}
            style={{display: 'inline-block', opacity: p, translate: `0px ${(1 - p) * 0.4}em`, filter: `blur(${(1 - p) * 8}px)`}}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Thin gold rule that draws from the centre.
export const Rule: React.FC<{readonly delay: number; readonly width: number; readonly color: string}> = ({
  delay,
  width,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        height: 2,
        width,
        backgroundColor: color,
        scale: `${interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        })} 1`,
      }}
    />
  );
};
