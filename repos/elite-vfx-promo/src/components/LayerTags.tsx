import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, LayerSegment} from '../config';
import {WIPE_LINE_X} from '../data/wipeLine';
import {sans} from '../fonts';
import {useLayout} from '../layout';
import {Clip, useReelToFrameX} from './Footage';

const REEL_FPS = 30;

const Tag: React.FC<{readonly text: string; readonly u: number; readonly size: number; readonly style: React.CSSProperties}> = ({
  text,
  u,
  size,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      gap: 10 * u,
      padding: `${8 * u}px ${14 * u}px`,
      borderRadius: 4 * u,
      backgroundColor: 'rgba(5,5,5,0.62)',
      border: `1px solid rgba(179,159,121,0.55)`,
      fontFamily: sans,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.2em',
      color: BRAND.colors.ivory,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <div style={{width: 7 * u, height: 7 * u, borderRadius: 99, backgroundColor: BRAND.colors.gold}} />
    {text}
  </div>
);

// PLATE / CG / FINAL tags over the reel's wipes. During a wipe one tag sits each side of the
// line and travels with it; during a hold a single tag names the layer on screen.
export const LayerTags: React.FC<{readonly clip: Clip; readonly segments: readonly LayerSegment[]; readonly push?: number}> = ({
  clip,
  segments,
  push = 0.03,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {u, vertical, frame: box} = useLayout();
  const toFrameX = useReelToFrameX(clip.focusX, push);

  const reelFrame = Math.floor((clip.from + (frame / fps) * clip.rate) * REEL_FPS + 1e-6);
  const seg = segments.find((s) => reelFrame >= s.from && reelFrame <= s.to);
  if (!seg) return null;

  const size = (vertical ? 28 : 24) * u;
  const inset = 28 * u;
  const gap = 16 * u;
  const top = box.top + inset;
  const fade = interpolate(frame, [0, 8, durationInFrames - 8, durationInFrames - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Rough tag width, used to hide a tag when its side of the wipe is too narrow to hold it
  const widthOf = (text: string) => text.length * size * 0.92 + 60 * u;

  if ('tag' in seg) {
    if (!seg.tag) return null;
    return <Tag text={seg.tag} u={u} size={size} style={{top, left: box.left + inset, opacity: fade}} />;
  }

  const x = WIPE_LINE_X[reelFrame];
  if (x < 0) return null;
  const lineX = toFrameX(x);
  const leftRoom = Math.min(lineX, box.width) - gap - inset;
  const rightRoom = box.width - Math.max(lineX, 0) - gap - inset;
  const fit = (room: number, text: string) => interpolate(room - widthOf(text), [-20 * u, 20 * u], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {seg.left ? (
        <Tag
          text={seg.left}
          u={u}
          size={size}
          style={{top, right: box.width - Math.min(lineX, box.width) + gap, opacity: fade * fit(leftRoom, seg.left)}}
        />
      ) : null}
      {seg.right ? (
        <Tag
          text={seg.right}
          u={u}
          size={size}
          style={{top, left: box.left + Math.max(lineX, 0) + gap, opacity: fade * fit(rightRoom, seg.right)}}
        />
      ) : null}
    </>
  );
};
