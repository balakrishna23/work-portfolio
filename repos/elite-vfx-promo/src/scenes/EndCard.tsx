import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FOOTAGE} from '../config';
import {CallToAction} from '../components/CallToAction';
import {FullBleedFootage} from '../components/Footage';

export const EndCard: React.FC = () => {
  return (
    <AbsoluteFill>
      <FullBleedFootage clip={FOOTAGE.endCard} brightness={0.22} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(179,159,121,0.16) 0%, rgba(0,0,0,0) 55%)'}} />
      <CallToAction />
    </AbsoluteFill>
  );
};
