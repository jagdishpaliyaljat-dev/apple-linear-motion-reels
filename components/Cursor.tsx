/**
 * Cursor — Smooth simulated SVG mouse cursor with Bezier motion, scale dip & concentric click ripple
 *
 * Usage:
 *   <Cursor
 *     startX={680}
 *     startY={1100}
 *     targetX={540}
 *     targetY={860}
 *     clickFrame={32}
 *     startFrame={0}
 *   />
 */

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from 'remotion';

interface CursorProps {
  startX?: number;
  startY?: number;
  targetX: number;
  targetY: number;
  startFrame?: number;
  moveFrames?: number; // duration of movement towards target (default 24)
  clickFrame: number;  // local frame relative to startFrame when click occurs
}

export const Cursor: React.FC<CursorProps> = ({
  startX = 700,
  startY = 1200,
  targetX,
  targetY,
  startFrame = 0,
  moveFrames = 24,
  clickFrame = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Bezier interpolated travel path
  const moveProgress = interpolate(localFrame, [0, moveFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  });

  const curX = interpolate(moveProgress, [0, 1], [startX, targetX]);
  const curY = interpolate(moveProgress, [0, 1], [startY, targetY]);

  // Click physics: compress scale to 0.82 on clickFrame, then spring back
  const clickAge = Math.max(0, localFrame - clickFrame);
  const isClicked = localFrame >= clickFrame;

  const clickSpring = spring({
    frame: clickAge,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.6 },
  });

  const cursorScale = isClicked
    ? interpolate(clickSpring, [0, 0.35, 1], [1, 0.82, 1], { extrapolateRight: 'clamp' })
    : 1;

  // Expanding ripple ring
  const rippleProgress = interpolate(clickAge, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.8, 2.8]);
  const rippleOpacity = isClicked
    ? interpolate(rippleProgress, [0, 0.2, 1], [0, 0.75, 0])
    : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 300 }}>
      {/* Ripple wave upon click */}
      {isClicked && rippleOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: targetX - 25,
            top: targetY - 25,
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid #2563EB',
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Vector Cursor Pointer */}
      <div
        style={{
          position: 'absolute',
          left: curX,
          top: curY,
          transform: `scale(${cursorScale})`,
          filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45))',
          willChange: 'transform',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
            fill="#FFFFFF"
            stroke="#09090B"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
