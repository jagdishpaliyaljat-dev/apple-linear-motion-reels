/**
 * SelectionBox — Blue selection rectangle with 4 white corner handles
 *
 * Section 8.6 compliant:
 * - Proper handle offsets
 * - Selection badge tag outside the target area with 6px padding to prevent clipping
 */

import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';

interface SelectionBoxProps {
  width: number;
  height: number;
  x: number;
  y: number;
  startFrame?: number;
  durationInFrames?: number;
  label?: string;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  width,
  height,
  x,
  y,
  startFrame = 0,
  durationInFrames = 8,
  label,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  if (frame < startFrame) return null;

  const progress = interpolate(localFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const curWidth = width * progress;
  const curHeight = height * progress;
  const handleSize = 7;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 6,
        top: y - 6,
        width: curWidth + 12,
        height: curHeight + 12,
        border: '2px solid #2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        boxShadow: '0 0 16px rgba(37, 99, 235, 0.25)',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* 4 Corner white handles */}
      {progress > 0.4 && (
        <>
          {/* Top-Left */}
          <div
            style={{
              position: 'absolute',
              left: -handleSize / 2,
              top: -handleSize / 2,
              width: handleSize,
              height: handleSize,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #2563EB',
            }}
          />
          {/* Top-Right */}
          <div
            style={{
              position: 'absolute',
              right: -handleSize / 2,
              top: -handleSize / 2,
              width: handleSize,
              height: handleSize,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #2563EB',
            }}
          />
          {/* Bottom-Left */}
          <div
            style={{
              position: 'absolute',
              left: -handleSize / 2,
              bottom: -handleSize / 2,
              width: handleSize,
              height: handleSize,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #2563EB',
            }}
          />
          {/* Bottom-Right */}
          <div
            style={{
              position: 'absolute',
              right: -handleSize / 2,
              bottom: -handleSize / 2,
              width: handleSize,
              height: handleSize,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #2563EB',
            }}
          />
        </>
      )}

      {/* Selection pill badge strictly outside the selection box */}
      {label && progress >= 1 && (
        <div
          style={{
            position: 'absolute',
            top: -28,
            left: -2,
            padding: '3px 10px',
            backgroundColor: '#2563EB',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
