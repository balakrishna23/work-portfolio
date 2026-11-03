import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {BRAND, COPY, FOOTAGE} from '../config';
import {FootageWindow} from '../components/Footage';
import {Flash} from '../components/Overlays';
import {Words} from '../components/Type';
import {sans, serif} from '../fonts';
import {useLayout} from '../layout';

const Word: React.FC<{readonly text: string}> = ({text}) => {
  const {u, vertical} = useLayout();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 800,
          fontSize: (vertical ? 104 : 132) * u,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: BRAND.colors.ivory,
          textShadow: '0 6px 40px rgba(0,0,0,0.65)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Quick cuts on the beat naming the work, then the tagline.
export const Montage: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const {u, vertical} = useLayout();
  const beat = Math.round((60 / 100.6) * fps); // one beat of the track
  const [a, b, c, d] = FOOTAGE.montage;
  const taglineFrom = beat * 3;
  return (
    <AbsoluteFill>
      <Sequence name="Commercials" durationInFrames={beat}>
        <FootageWindow clip={a} dim={0.25} />
        <Word text={COPY.montage[0]} />
      </Sequence>
      <Sequence name="Music videos" from={beat} durationInFrames={beat}>
        <FootageWindow clip={b} dim={0.25} />
        <Word text={COPY.montage[1]} />
      </Sequence>
      <Sequence name="Films" from={beat * 2} durationInFrames={beat}>
        <FootageWindow clip={c} dim={0.25} />
        <Word text={COPY.montage[2]} />
      </Sequence>
      <Sequence name="Tagline" from={taglineFrom} durationInFrames={durationInFrames - taglineFrom}>
        <FootageWindow clip={d} dim={0.35} push={0.05} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <Words
            text={COPY.tagline}
            stagger={3}
            style={{
              fontFamily: serif,
              fontSize: (vertical ? 96 : 104) * u,
              lineHeight: 1.15,
              color: BRAND.colors.ivory,
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: (vertical ? 900 : 1500) * u,
              textShadow: '0 6px 40px rgba(0,0,0,0.6)',
            }}
          />
        </AbsoluteFill>
      </Sequence>
      {[beat, beat * 2].map((at) => (
        <Sequence key={at} name="Beat flash" from={at} durationInFrames={4}>
          <Flash strength={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
