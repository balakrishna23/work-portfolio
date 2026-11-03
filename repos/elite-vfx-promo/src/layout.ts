import {useVideoConfig} from 'remotion';
import {FOOTAGE} from './config';

// One set of components serves both formats. Landscape shows the reel's full width between
// cinematic bars; vertical recomposes it into a cropped window with type above and below.
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const pictureRows = FOOTAGE.pictureBottom - FOOTAGE.pictureTop;
  const frame = vertical
    ? {left: 0, top: 540, width, height: 780}
    : {left: 0, top: 182, width, height: Math.round((width / FOOTAGE.width) * pictureRows)};
  return {
    vertical,
    width,
    height,
    frame,
    scale: frame.height / pictureRows,
    // Base unit for type: 1 at 1920 landscape, about 1 at 1080 vertical
    u: vertical ? width / 1080 : width / 1920,
  };
};
