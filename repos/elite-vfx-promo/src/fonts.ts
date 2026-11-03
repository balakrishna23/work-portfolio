import {loadFont as loadBodoni} from '@remotion/google-fonts/BodoniModa';
import {loadFont as loadNunito} from '@remotion/google-fonts/NunitoSans';

// Stand-ins for the website's Didot Italic (accent lines) and Avenir (wordmark, labels),
// which are licensed Wix fonts. Swap these for local font files if you have the originals.
export const serif = loadBodoni('italic', {weights: ['400', '500'], subsets: ['latin']}).fontFamily;
export const sans = loadNunito('normal', {weights: ['300', '600', '800'], subsets: ['latin']}).fontFamily;
