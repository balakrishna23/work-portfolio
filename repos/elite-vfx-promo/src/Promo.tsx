import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BRAND, COPY, FOOTAGE, LAYER_TAGS, MUSIC, SCENES, SCENES_SHORT, SFX} from './config';
import {Flash, Grain, LightLeak, Whip} from './components/Overlays';
import {Breakdown} from './scenes/Breakdown';
import {EndCard} from './scenes/EndCard';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Montage} from './scenes/Montage';

export type Cut = 'full' | 'short';
type Scenes = Record<string, number>;

const scenesFor = (cut: Cut): Scenes => (cut === 'short' ? SCENES_SHORT : SCENES);

// [start, duration] of each scene in frames. Rounding the running total (not each duration)
// keeps the sum exact, so 30s of scenes is exactly 900 frames.
export const sceneStarts = (fps: number, scenes: Scenes) => {
  let t = 0;
  const starts: Record<string, [number, number]> = {};
  for (const key of Object.keys(scenes)) {
    const from = Math.round(t * fps);
    t += scenes[key];
    starts[key] = [from, Math.round(t * fps) - from];
  }
  return starts;
};

export const promoDuration = (fps: number, cut: Cut) =>
  Math.round(Object.values(scenesFor(cut)).reduce((a, b) => a + b, 0) * fps);

const Sfx: React.FC<{readonly name: string; readonly at: number; readonly sound: {src: string; volume: number}}> = ({
  name,
  at,
  sound,
}) => <Audio name={name} src={staticFile(sound.src)} from={Math.max(0, at)} volume={sound.volume} />;

export const Promo: React.FC<{readonly cut: Cut}> = ({cut}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const short = cut === 'short';
  const s = sceneStarts(fps, scenesFor(cut));
  const [f1, f2, f3] = COPY.features;
  const beat = Math.round((60 / 100.6) * fps);
  const last = short ? s.feature2 : s.feature3;
  // Cuts that get a whip, a whoosh and a hit
  const whipCuts = short ? [s.feature1[0], s.feature2[0]] : [s.feature1[0], s.feature2[0], s.feature3[0], s.montage[0]];
  const duckPoints = [s.intro[0], ...whipCuts, s.endCard[0]];

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.colors.black}}>
      <Sequence name="Hook" from={s.hook[0]} durationInFrames={s.hook[1]}>
        <Hook />
      </Sequence>
      <Sequence name="Intro" from={s.intro[0]} durationInFrames={s.intro[1]}>
        <Whip id="intro" enter={false}>
          <Intro compact={short} />
        </Whip>
      </Sequence>
      {short ? (
        <>
          <Sequence name="01 3D · CGI" from={s.feature1[0]} durationInFrames={s.feature1[1]}>
            <Whip id="f1">
              <Breakdown clip={FOOTAGE.short.feature1} number="01" label={f1.label} caption={f1.caption} total={2} layers={LAYER_TAGS.truck} />
            </Whip>
          </Sequence>
          <Sequence name="02 FX" from={s.feature2[0]} durationInFrames={s.feature2[1]}>
            <Whip id="f2" exit={false}>
              <Breakdown clip={FOOTAGE.short.feature2} number="02" label={f3.label} caption={f3.caption} total={2} layers={LAYER_TAGS.explosion} />
            </Whip>
          </Sequence>
        </>
      ) : (
        <>
          <Sequence name="01 3D · CGI" from={s.feature1[0]} durationInFrames={s.feature1[1]}>
            <Whip id="f1">
              <Breakdown clip={FOOTAGE.feature1} number={f1.number} label={f1.label} caption={f1.caption} total={3} layers={LAYER_TAGS.truck} />
            </Whip>
          </Sequence>
          <Sequence name="02 Set extension" from={s.feature2[0]} durationInFrames={s.feature2[1]}>
            <Whip id="f2">
              <Breakdown clip={FOOTAGE.feature2} number={f2.number} label={f2.label} caption={f2.caption} total={3} layers={LAYER_TAGS.street} />
            </Whip>
          </Sequence>
          <Sequence name="03 FX" from={s.feature3[0]} durationInFrames={s.feature3[1]}>
            <Whip id="f3">
              <Breakdown clip={FOOTAGE.feature3} number={f3.number} label={f3.label} caption={f3.caption} total={3} layers={LAYER_TAGS.explosion} />
            </Whip>
          </Sequence>
          <Sequence name="Montage" from={s.montage[0]} durationInFrames={s.montage[1]}>
            <Whip id="montage" exit={false}>
              <Montage />
            </Whip>
          </Sequence>
        </>
      )}
      <Sequence name="End card" from={s.endCard[0]} durationInFrames={s.endCard[1]}>
        <EndCard />
      </Sequence>

      {/* The drop: a white hit and a light leak into the logo */}
      <Sequence name="Drop flash" from={s.intro[0]} durationInFrames={10}>
        <Flash strength={0.9} />
      </Sequence>
      <Sequence name="Drop leak" from={s.intro[0] - 4} durationInFrames={22}>
        <LightLeak strength={0.8} />
      </Sequence>
      {short ? null : (
        <Sequence name="Montage leak" from={last[0] + last[1] - 8} durationInFrames={16}>
          <LightLeak strength={0.55} />
        </Sequence>
      )}
      <Sequence name="End card leak" from={s.endCard[0] - 10} durationInFrames={24}>
        <LightLeak strength={0.7} />
      </Sequence>

      <Grain />

      <Audio
        name="Music"
        src={staticFile(MUSIC.src)}
        trimBefore={Math.round(MUSIC.startAt * fps)}
        volume={(f) =>
          interpolate(f, [0, 6, durationInFrames - 36, durationInFrames - 1], [0, MUSIC.volume, MUSIC.volume, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }) *
          // Duck under each impact so the hits land without clipping the (hot) track
          duckPoints.reduce(
            (gain, at) =>
              gain * interpolate(f, [at - 2, at, at + 6, at + 14], [1, MUSIC.duck, MUSIC.duck, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            1,
          )
        }
      />

      {/* Sound design */}
      <Sfx name="Open hit" at={0} sound={SFX.hit} />
      <Sfx name="Hook cut whoosh" at={Math.round(s.hook[1] / 2) - 6} sound={SFX.whoosh} />
      <Sfx name="Hook cut hit" at={Math.round(s.hook[1] / 2)} sound={SFX.hit} />
      <Sfx name="Riser" at={s.intro[0] - Math.round(1.6 * fps)} sound={SFX.riser} />
      <Sfx name="Drop impact" at={s.intro[0]} sound={SFX.impact} />
      <Sfx name="Logo shimmer" at={s.intro[0] + 18} sound={SFX.shimmer} />
      {whipCuts.map((at) => (
        <React.Fragment key={at}>
          <Sfx name="Whip whoosh" at={at - 6} sound={SFX.whoosh} />
          <Sfx name="Cut hit" at={at} sound={SFX.hit} />
        </React.Fragment>
      ))}
      {short ? null : (
        <>
          <Sfx name="Beat hit" at={s.montage[0] + beat} sound={SFX.hit} />
          <Sfx name="Beat hit" at={s.montage[0] + beat * 2} sound={SFX.hit} />
          <Sfx name="Tagline shimmer" at={s.montage[0] + beat * 3} sound={SFX.shimmer} />
        </>
      )}
      <Sfx name="End card whoosh" at={s.endCard[0] - 6} sound={SFX.whoosh} />
      <Sfx name="End card impact" at={s.endCard[0]} sound={{...SFX.impact, volume: SFX.impact.volume * 0.6}} />
      <Sfx name="Button shimmer" at={s.endCard[0] + 36} sound={SFX.shimmer} />
    </AbsoluteFill>
  );
};
