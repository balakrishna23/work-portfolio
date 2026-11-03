import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, LayerSegment} from '../config';
import {Clip, FootageWindow} from '../components/Footage';
import {LayerTags} from '../components/LayerTags';
import {Reveal, Words} from '../components/Type';
import {sans, serif} from '../fonts';
import {useLayout} from '../layout';

type Props = {
  readonly clip: Clip;
  readonly number: string;
  readonly label: string;
  readonly caption: string;
  readonly total: number;
  readonly layers: readonly LayerSegment[];
};

// Gold hairline along the bottom of the footage that fills as the scene plays.
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frame: box} = useLayout();
  return (
    <div
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top + box.height - 3,
        height: 3,
        width: box.width,
        backgroundColor: BRAND.colors.gold,
        transformOrigin: 'left',
        scale: `${interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)})} 1`,
      }}
    />
  );
};

const labelStyle = (size: number): React.CSSProperties => ({
  fontFamily: sans,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: BRAND.colors.gold,
});

// One before/after shot from the reel, labelled with the service it shows.
export const Breakdown: React.FC<Props> = ({clip, number, label, caption, total, layers}) => {
  const {u, vertical, frame, width} = useLayout();
  const counter = `Breakdown ${number} / ${String(total).padStart(2, '0')}`;

  if (vertical) {
    return (
      <AbsoluteFill>
        <FootageWindow clip={clip} />
        <LayerTags clip={clip} segments={layers} />
        <Progress />
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 170 * u}}>
          <Reveal delay={0} rise={40}>
            <div style={{fontFamily: serif, fontSize: 210 * u, lineHeight: 1, color: BRAND.colors.gold, textAlign: 'center'}}>
              {number}
            </div>
          </Reveal>
          <Reveal delay={6} style={{marginTop: 24 * u, textAlign: 'center', maxWidth: 940 * u}}>
            <div style={labelStyle(34 * u)}>{label}</div>
          </Reveal>
        </AbsoluteFill>
        <div style={{position: 'absolute', top: frame.top + frame.height + 80 * u, width, display: 'flex', justifyContent: 'center'}}>
          <Words
            text={caption}
            delay={12}
            style={{
              fontFamily: serif,
              fontSize: 70 * u,
              lineHeight: 1.2,
              color: BRAND.colors.ivory,
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: 900 * u,
            }}
          />
        </div>
      </AbsoluteFill>
    );
  }

  const barTop = frame.top + frame.height;
  return (
    <AbsoluteFill>
      <FootageWindow clip={clip} />
      <LayerTags clip={clip} segments={layers} />
      <Progress />
      {/* Top bar: quiet brand and counter */}
      <Reveal
        delay={0}
        rise={0}
        style={{
          position: 'absolute',
          top: 0,
          height: frame.top,
          left: 120 * u,
          right: 120 * u,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{...labelStyle(22 * u), opacity: 0.75}}>{BRAND.name}</div>
        <div style={{...labelStyle(22 * u), color: BRAND.colors.muted}}>{counter}</div>
      </Reveal>
      {/* Bottom bar: number, service and caption */}
      <div
        style={{
          position: 'absolute',
          top: barTop,
          height: 1080 * u - barTop,
          left: 120 * u,
          right: 120 * u,
          display: 'flex',
          alignItems: 'center',
          gap: 44 * u,
        }}
      >
        <Reveal delay={0} rise={30}>
          <div style={{fontFamily: serif, fontSize: 112 * u, lineHeight: 1, color: BRAND.colors.gold}}>{number}</div>
        </Reveal>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10 * u}}>
          <Reveal delay={5}>
            <div style={labelStyle(28 * u)}>{label}</div>
          </Reveal>
          <Words
            text={caption}
            delay={10}
            style={{fontFamily: serif, fontSize: 50 * u, lineHeight: 1.15, color: BRAND.colors.ivory}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
