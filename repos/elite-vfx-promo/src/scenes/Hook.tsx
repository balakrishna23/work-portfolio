import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {BRAND, COPY, FOOTAGE, LAYER_TAGS} from '../config';
import {FootageWindow, StillWindow} from '../components/Footage';
import {LayerTags} from '../components/LayerTags';
import {Flash} from '../components/Overlays';
import {Words} from '../components/Type';
import {serif} from '../fonts';
import {useLayout} from '../layout';

const Line: React.FC<{readonly text: string; readonly color: string}> = ({text, color}) => {
  const {vertical, u, frame} = useLayout();
  return (
    <AbsoluteFill
      style={{
        // Vertical: above the footage. Landscape: centred over it.
        justifyContent: vertical ? 'flex-start' : 'center',
        alignItems: 'center',
        paddingTop: vertical ? frame.top - 340 * u : 0,
      }}
    >
      <Words
        text={text}
        stagger={4}
        style={{
          fontFamily: serif,
          fontSize: (vertical ? 108 : 120) * u,
          color,
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: vertical ? 900 * u : 1500 * u,
          textShadow: '0 4px 18px rgba(0,0,0,0.85), 0 0 60px rgba(0,0,0,0.7)',
        }}
      />
    </AbsoluteFill>
  );
};

// 0–3s: the on-set plate, then the same angle as delivered. Freeze, then payoff.
export const Hook: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const half = Math.round(durationInFrames / 2);
  return (
    <AbsoluteFill>
      <Sequence name="Plate" durationInFrames={half}>
        <StillWindow src={FOOTAGE.hookPlateStill} focusX={0.47} />
        {/* The freeze is reel frame 620 (20.66s), inside the explosion shot's PLATE hold */}
        <LayerTags clip={{from: 20.66, rate: 0, focusX: 0.47}} segments={LAYER_TAGS.explosion} push={0.04} />
        <Line text={COPY.hookPlate} color={BRAND.colors.ivory} />
      </Sequence>
      <Sequence name="Final" from={half}>
        <FootageWindow clip={FOOTAGE.hookFinal} dim={0.3} push={0.05} />
        <LayerTags clip={FOOTAGE.hookFinal} segments={LAYER_TAGS.explosion} push={0.05} />
        <Line text={COPY.hookFinal} color={BRAND.colors.gold} />
      </Sequence>
      <Sequence name="Cut flash" from={half} durationInFrames={Math.round(0.25 * fps)}>
        <Flash strength={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
