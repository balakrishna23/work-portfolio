import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FOOTAGE} from '../config';
import {useLayout} from '../layout';

export type Clip = {readonly from: number; readonly rate: number; readonly focusX: number};

// Places a source the size of the reel so its picture area fills the layout's footage frame.
// In vertical, `focusX` picks which part of the wide picture stays in the crop.
const useSourceBox = (focusX: number) => {
  const {frame, scale} = useLayout();
  const w = FOOTAGE.width * scale;
  const h = FOOTAGE.height * scale;
  const left = Math.min(0, Math.max(frame.width - w, frame.width / 2 - focusX * w));
  const top = -FOOTAGE.pictureTop * scale;
  return {position: 'absolute', left, top, width: w, height: h} as const;
};

const pushScale = (frame: number, durationInFrames: number, amount: number) =>
  interpolate(frame, [0, durationInFrames], [1, 1 + amount], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

const PushIn: React.FC<{readonly amount: number; readonly children: React.ReactNode}> = ({amount, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{scale: pushScale(frame, durationInFrames, amount)}}>{children}</AbsoluteFill>;
};

// Maps an x position in the reel's own pixels to x inside the footage frame on screen,
// following the same crop and push-in as FootageWindow, so overlays can track the picture.
export const useReelToFrameX = (focusX: number, push: number) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frame: box, scale} = useLayout();
  const src = useSourceBox(focusX);
  const s = pushScale(frame, durationInFrames, push);
  return (reelX: number) => box.width / 2 + (src.left + reelX * scale - box.width / 2) * s;
};

// Vertical only: a blurred, darkened full-frame copy of the shot behind the sharp window,
// so the space around the type carries the scene's colour instead of flat black.
const Backdrop: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  const {vertical} = useLayout();
  if (!vertical) return null;
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: 'blur(36px) brightness(0.32) saturate(1.2)', scale: 1.15}}>
      {children}
    </AbsoluteFill>
  );
};

const FrameBox: React.FC<{readonly dim: number; readonly blur: number; readonly children: React.ReactNode}> = ({
  dim,
  blur,
  children,
}) => {
  const {frame} = useLayout();
  return (
    <div
      style={{
        position: 'absolute',
        ...frame,
        overflow: 'hidden',
        backgroundColor: '#000',
        filter: dim || blur ? `brightness(${1 - dim}) blur(${blur}px)` : undefined,
      }}
    >
      {children}
      {/* Soft vignette keeps type readable and draws the eye to the centre */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}}
      />
    </div>
  );
};

export const FootageWindow: React.FC<{
  readonly clip: Clip;
  readonly dim?: number;
  readonly blur?: number;
  readonly push?: number;
}> = ({clip, dim = 0, blur = 0, push = 0.03}) => {
  const {fps} = useVideoConfig();
  const box = useSourceBox(clip.focusX);
  const trimBefore = Math.round(clip.from * fps);
  return (
    <>
      <Backdrop>
        <Video
          src={staticFile(FOOTAGE.src)}
          trimBefore={trimBefore}
          playbackRate={clip.rate}
          muted
          objectFit="cover"
          style={{width: '100%', height: '100%'}}
        />
      </Backdrop>
      <FrameBox dim={dim} blur={blur}>
        <PushIn amount={push}>
          <Video src={staticFile(FOOTAGE.src)} trimBefore={trimBefore} playbackRate={clip.rate} muted objectFit="fill" style={box} />
        </PushIn>
      </FrameBox>
    </>
  );
};

// Whole-frame, heavily blurred and darkened footage: a moving texture behind an end card.
export const FullBleedFootage: React.FC<{readonly clip: Clip; readonly brightness: number}> = ({clip, brightness}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: `blur(28px) brightness(${brightness})`, scale: 1.15}}>
      <Video
        src={staticFile(FOOTAGE.src)}
        trimBefore={Math.round(clip.from * fps)}
        playbackRate={clip.rate}
        muted
        objectFit="cover"
        style={{width: '100%', height: '100%'}}
      />
    </AbsoluteFill>
  );
};

export const StillWindow: React.FC<{readonly src: string; readonly focusX: number; readonly push?: number}> = ({
  src,
  focusX,
  push = 0.04,
}) => {
  const box = useSourceBox(focusX);
  return (
    <>
      <Backdrop>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Backdrop>
      <FrameBox dim={0} blur={0}>
        <PushIn amount={push}>
          <Img src={staticFile(src)} style={box} />
        </PushIn>
      </FrameBox>
    </>
  );
};
