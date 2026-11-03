import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {CallToAction} from './components/CallToAction';
import {Promo, promoDuration} from './Promo';
import {Thumbnail} from './Thumbnail';

// Durations come from SCENES / SCENES_SHORT in src/config.ts.
// Render at 4K with --scale=2 (see package.json scripts).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Promo-30s">
        <Composition
          id="Promo-Landscape"
          component={Promo}
          durationInFrames={promoDuration(30, 'full')}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{cut: 'full' as const}}
        />
        <Composition
          id="Promo-Vertical"
          component={Promo}
          durationInFrames={promoDuration(30, 'full')}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{cut: 'full' as const}}
        />
      </Folder>
      <Folder name="Promo-15s">
        <Composition
          id="Promo15-Landscape"
          component={Promo}
          durationInFrames={promoDuration(30, 'short')}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{cut: 'short' as const}}
        />
        <Composition
          id="Promo15-Vertical"
          component={Promo}
          durationInFrames={promoDuration(30, 'short')}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{cut: 'short' as const}}
        />
      </Folder>
      <Folder name="Thumbnails">
        <Still
          id="Thumbnail-Landscape"
          component={Thumbnail}
          width={1920}
          height={1080}
          defaultProps={{still: 'stills/thumb-explosion-4k.png', focusX: 0.6}}
        />
        <Still
          id="Thumbnail-Vertical"
          component={Thumbnail}
          width={1080}
          height={1920}
          defaultProps={{still: 'stills/thumb-explosion-4k.png', focusX: 0.47}}
        />
      </Folder>
      <Folder name="Elements">
        {/* Transparent end card, reusable as an overlay on other edits */}
        <Composition id="CTA-Overlay" component={CallToAction} durationInFrames={120} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
