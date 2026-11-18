/**
 * CameraRig — 4-stage keyframed camera choreography container
 *
 * Stage 1 (0–18%):  Punch-In     scale: 0.94 → 1.05
 * Stage 2 (18–60%): Detail Focus scale: 1.05 → focusScale, pan to focusPanX/Y
 * Stage 3 (60–72%): Micro-Recoil scale: focusScale → (focusScale - 0.03)
 * Stage 4 (72–100%): Pull-Back   scale: → 1.02, pan → 0
 *
 * Usage:
 *   <CameraRig durationInFrames={90} focusScale={1.18} focusPanX={-30} focusPanY={20}>
 *     {children}
 *   </CameraRig>
 */

import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';

interface CameraRigProps {
  children: React.ReactNode;
  durationInFrames: number;
  focusScale?: number;   // zoom during Stage 2 (default 1.18)
  focusPanX?: number;    // px pan X during Stage 2 (default -30)
  focusPanY?: number;    // px pan Y during Stage 2 (default 20)
  startFrame?: number;   // local frame offset (default 0)
}

export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  durationInFrames,
  focusScale = 1.28,
  focusPanX = -50,
  focusPanY = 35,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const progress = Math.min(1, Math.max(0, localFrame / durationInFrames));

  const easing = Easing.bezier(0.25, 0.1, 0.25, 1.0);

  const scale = interpolate(
    progress,
    [0, 0.18, 0.60, 0.72, 1.0],
    [0.92, 1.06, focusScale, focusScale - 0.04, 1.0],
    { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panX = interpolate(
    progress,
    [0, 0.18, 0.60, 0.72, 1.0],
    [0, 0, focusPanX, focusPanX * 0.7, 0],
    { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panY = interpolate(
    progress,
    [0, 0.18, 0.60, 0.72, 1.0],
    [0, 0, focusPanY, focusPanY * 0.7, 0],
    { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Dynamic continuous organic camera breathing
  const driftX = Math.sin((localFrame / durationInFrames) * Math.PI * 2) * 16;
  const driftY = Math.cos((localFrame / durationInFrames) * Math.PI * 2) * 12;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        position: 'relative',
        transformOrigin: '50% 48%',
        transform: `scale(${scale}) translate(${panX + driftX}px, ${panY + driftY}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
