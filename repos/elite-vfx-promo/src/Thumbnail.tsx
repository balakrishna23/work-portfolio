import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, COPY} from './config';
import {LogoLockup} from './components/Logo';
import {sans, serif} from './fonts';
import {useLayout} from './layout';

export const Thumbnail: React.FC<{readonly still: string; readonly focusX: number}> = ({still, focusX}) => {
  const {u, vertical} = useLayout();
  return (
    <AbsoluteFill style={{backgroundColor: BRAND.colors.black}}>
      <Img
        src={staticFile(still)}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focusX * 100}% 50%`}}
      />
      <AbsoluteFill
        style={{
          background: vertical
            ? 'linear-gradient(180deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.1) 35%, rgba(5,5,5,0.2) 55%, rgba(5,5,5,0.95) 80%)'
            : 'linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0) 75%)',
        }}
      />
      <AbsoluteFill
        style={{
          padding: vertical ? `${150 * u}px ${80 * u}px` : `${110 * u}px ${130 * u}px`,
          justifyContent: 'space-between',
          alignItems: vertical ? 'center' : 'flex-start',
        }}
      >
        <LogoLockup size={(vertical ? 130 : 110) * u} animate={false} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 36 * u, alignItems: vertical ? 'center' : 'flex-start'}}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: (vertical ? 30 : 26) * u,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: BRAND.colors.gold,
            }}
          >
            VFX · CGI · Compositing
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: (vertical ? 118 : 128) * u,
              lineHeight: 1.05,
              color: BRAND.colors.ivory,
              maxWidth: (vertical ? 920 : 1000) * u,
              textAlign: vertical ? 'center' : 'left',
              textShadow: '0 6px 40px rgba(0,0,0,0.6)',
            }}
          >
            {COPY.tagline}
          </div>
          <div
            style={{
              padding: `${18 * u}px ${52 * u}px`,
              borderRadius: 999,
              backgroundColor: BRAND.colors.gold,
              color: BRAND.colors.black,
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 34 * u,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {COPY.cta}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
