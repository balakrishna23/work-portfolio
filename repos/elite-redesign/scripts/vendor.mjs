import {copyFileSync} from 'node:fs';
for (const [source, target] of [['gsap/dist/gsap.min.js','gsap.min.js'],['gsap/dist/ScrollTrigger.min.js','ScrollTrigger.min.js'],['lenis/dist/lenis.min.js','lenis.min.js'],['lenis/dist/lenis.css','lenis.css']]) {
  copyFileSync(`node_modules/${source}`,`dist/assets/${target}`);
}
console.log('GSAP, ScrollTrigger and Lenis copied to local site assets.');
