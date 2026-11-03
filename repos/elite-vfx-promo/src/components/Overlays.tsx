import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Light film grain over the whole frame; the seed changes every frame so it lives.
export const Grain: React.FC<{readonly opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Warm anamorphic light leak that sweeps across a cut. Centre the sequence on the cut.
export const LightLeak: React.FC<{readonly strength?: number}> = ({strength = 0.7}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const x = interpolate(p, [0, 1], [-20, 120]);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: Math.sin(Math.PI * Math.min(1, Math.max(0, p))) * strength,
        background: [
          `radial-gradient(ellipse 38% 70% at ${x}% 45%, rgba(255,150,60,0.95) 0%, rgba(255,110,40,0.35) 45%, rgba(0,0,0,0) 75%)`,
          `radial-gradient(ellipse 22% 40% at ${x - 18}% 60%, rgba(179,159,121,0.9) 0%, rgba(0,0,0,0) 70%)`,
          `linear-gradient(0deg, rgba(0,0,0,0) 44%, rgba(255,190,120,0.35) 50%, rgba(0,0,0,0) 56%)`,
        ].join(', '),
      }}
    />
  );
};

// Horizontal whip: the scene smears in from the right and out to the left over a few
// frames, so consecutive scenes read as one fast camera move across the cut.
export const Whip: React.FC<{
  readonly id: string;
  readonly enter?: boolean;
  readonly exit?: boolean;
  readonly frames?: number;
  readonly children: React.ReactNode;
}> = ({id, enter = true, exit = true, frames = 7, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const inP = enter ? interpolate(frame, [0, frames], [1, 0], {...opts, easing: (t) => 1 - (1 - t) ** 3}) : 0;
  const outP = exit
    ? interpolate(frame, [durationInFrames - frames + 2, durationInFrames - 1], [0, 1], {...opts, easing: (t) => t ** 3})
    : 0;
  const offset = (inP * 0.08 - outP * 0.08) * width;
  const blur = (inP + outP) * width * 0.03;
  const filterId = `whip-${id}`;
  return (
    <AbsoluteFill style={{translate: `${offset}px 0px`, filter: blur > 0.5 ? `url(#${filterId})` : undefined}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={filterId} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

// A quick exposure flash used on hard cuts.
export const Flash: React.FC<{readonly strength?: number; readonly color?: string}> = ({
  strength = 0.5,
  color = '#ffffff',
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: interpolate(frame, [0, durationInFrames], [strength, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        mixBlendMode: 'screen',
      }}
    />
  );
};
