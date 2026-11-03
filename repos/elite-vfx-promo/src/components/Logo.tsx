import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {BRAND} from '../config';
import {sans} from '../fonts';
import {LogoMark} from './LogoMark';

// The site's lockup: gold circle mark beside a widely tracked two-line wordmark.
export const LogoLockup: React.FC<{readonly size: number; readonly delay?: number; readonly animate?: boolean}> = ({
  size,
  delay = 0,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const t = (from: number, to: number) =>
    animate
      ? interpolate(frame, [delay + from, delay + to], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })
      : 1;
  const word = t(14, 38);
  // Brief glow as the last lines land
  const glow = animate
    ? interpolate(frame, [delay + 20, delay + 28, delay + 50], [0, 1, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0.25;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
      <LogoMark
        size={size}
        color={BRAND.colors.gold}
        delay={delay}
        animate={animate}
        style={{filter: `drop-shadow(0 0 ${size * 0.12 * glow}px rgba(179,159,121,${0.8 * glow}))`}}
      />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          color: BRAND.colors.gold,
          fontSize: size * 0.34,
          lineHeight: 1.18,
          letterSpacing: `${interpolate(word, [0, 1], [0.7, 0.32])}em`,
          opacity: word,
          clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
          whiteSpace: 'nowrap',
        }}
      >
        <div>{BRAND.wordmarkTop}</div>
        <div>{BRAND.wordmarkBottom}</div>
      </div>
    </div>
  );
};
