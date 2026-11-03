import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND, COPY, FOOTAGE} from '../config';
import {FootageWindow} from '../components/Footage';
import {LogoLockup} from '../components/Logo';
import {Reveal, Rule, Words} from '../components/Type';
import {sans, serif} from '../fonts';
import {useLayout} from '../layout';

// 3s: the music drops, the logo lands over a slowed, darkened shot from the reel.
// `compact` (15s cut) drops the sentence, which there is no time to read.
export const Intro: React.FC<{readonly compact?: boolean}> = ({compact = false}) => {
  const {u, vertical} = useLayout();
  return (
    <AbsoluteFill>
      <FootageWindow clip={compact ? FOOTAGE.short.intro : FOOTAGE.intro} dim={0.6} blur={4} push={0.06} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40 * u}}>
        <LogoLockup size={(vertical ? 190 : 150) * u} delay={2} />
        <Rule delay={24} width={(vertical ? 420 : 520) * u} color={BRAND.colors.gold} />
        {compact ? null : (
          <Words
            text={COPY.intro}
            delay={30}
            stagger={2}
            style={{
              fontFamily: serif,
              fontSize: (vertical ? 62 : 50) * u,
              lineHeight: 1.25,
              color: BRAND.colors.ivory,
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: (vertical ? 860 : 1180) * u,
            }}
          />
        )}
        <Reveal delay={compact ? 32 : 52}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: (vertical ? 30 : 24) * u,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: BRAND.colors.gold,
            }}
          >
            {BRAND.location}
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
