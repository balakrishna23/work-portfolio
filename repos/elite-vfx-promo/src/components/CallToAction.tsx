import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BRAND, COPY} from '../config';
import {sans, serif} from '../fonts';
import {useLayout} from '../layout';
import {LogoLockup} from './Logo';
import {Reveal} from './Type';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Button: React.FC<{readonly u: number; readonly delay: number}> = ({u, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  // Light sweep across the button once it has landed
  const sweep = interpolate(frame, [delay + 22, delay + 46], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: `${22 * u}px ${64 * u}px`,
        borderRadius: 999,
        backgroundColor: BRAND.colors.gold,
        color: BRAND.colors.black,
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 46 * u,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        opacity: p,
        scale: interpolate(p, [0, 1], [0.86, 1]),
        boxShadow: `0 ${18 * u}px ${60 * u}px rgba(179,159,121,0.28)`,
      }}
    >
      {COPY.cta}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sweep}%`,
          width: '30%',
          background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};

// Logo, call to action, URL and contact. Transparent background, so it also works as an
// overlay on other footage (see the "CTA-Overlay" composition).
export const CallToAction: React.FC = () => {
  const {u, vertical} = useLayout();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: (vertical ? 70 : 54) * u}}>
      <LogoLockup size={(vertical ? 170 : 165) * u} delay={0} />
      <Button u={u} delay={14} />
      <Reveal delay={22} exit={false} style={{textAlign: 'center'}}>
        <div style={{fontFamily: serif, fontSize: (vertical ? 64 : 62) * u, color: BRAND.colors.ivory}}>{BRAND.url}</div>
        <div
          style={{
            marginTop: 18 * u,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: (vertical ? 28 : 26) * u,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: BRAND.colors.muted,
          }}
        >
          {BRAND.contact} · {BRAND.location}
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
