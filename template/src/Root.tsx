import React from 'react';
import { Composition } from 'remotion';
import { Harness2Reel } from './Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Harness2Reel}
        durationInFrames={980}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
