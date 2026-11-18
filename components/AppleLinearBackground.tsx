import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export interface BackgroundProps {
  glowX?: number;
  glowY?: number;
}

export const AppleLinearBackground: React.FC<BackgroundProps> = ({
  glowX = 540,
  glowY = 960,
}) => {
  const frame = useCurrentFrame();

  // Smooth breathing pulse (continuous 60fps life)
  const pulse = interpolate(Math.sin(frame / 22), [-1, 1], [0.85, 1.15]);
  const driftY = Math.sin(frame / 36) * 16;
  const driftX = Math.cos(frame / 44) * 12;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#09090B',
        overflow: 'hidden',
      }}
    >
      {/* 40px Subtle Orthogonal Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* True Smooth Gaussian Blur Radial Ambient Glow (Breathing & Moving) */}
      <div
        style={{
          position: 'absolute',
          left: glowX - 450 + driftX,
          top: glowY - 450 + driftY,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle at center,
              rgba(37, 99, 235, 0.28) 0%,
              rgba(56, 189, 248, 0.12) 35%,
              rgba(9, 9, 11, 0) 72%
            )
          `,
          filter: 'blur(90px)',
          opacity: pulse,
          pointerEvents: 'none',
        }}
      />

      {/* Soft Vignette Rim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(9, 9, 11, 0.65) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
