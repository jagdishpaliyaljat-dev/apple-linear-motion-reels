/**
 * StatCard — count-up number card
 *
 * Section 8.2 compliant:
 * - Width: 460px
 * - Number: 74px bold font
 * - Sublabel: 20px
 * - Label: 15px uppercase
 * - Count-up over 24 frames
 * - Progress depth track at bottom
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface StatCardProps {
  label: string;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sublabel?: string;
  dimmed?: boolean;
  startFrame?: number;
  accentColor?: string;
  width?: number;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  targetValue,
  prefix = '',
  suffix = '',
  decimals = 1,
  sublabel,
  dimmed = false,
  startFrame = 0,
  accentColor = '#10B981',
  width = 460,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const motionBlur = interpolate(cardSpring, [0, 0.6, 1], [4, 1, 0], { extrapolateRight: 'clamp' });
  const translateY = interpolate(cardSpring, [0, 1], [6, 0], { extrapolateRight: 'clamp' });

  // Count-up: 0 → targetValue over 24 frames
  const countProgress = interpolate(
    localFrame,
    [4, 28],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );
  const currentValue = targetValue * countProgress;
  const displayValue = currentValue.toFixed(decimals);

  const targetOpacity = dimmed ? 0.35 : 1;
  const opacityProgress = interpolate(localFrame, [0, 15], [1, targetOpacity], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        padding: '30px 34px',
        backgroundColor: 'rgba(14,20,36,0.95)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        transform: `translateY(${translateY}px) scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring * opacityProgress,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 800,
          color: '#94A3B8',
          letterSpacing: '0.08em',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      {/* Big count-up number */}
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 74,
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 35px ${accentColor}60`,
        }}
      >
        {prefix}{displayValue}{suffix}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            color: '#64748B',
            marginTop: 10,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {sublabel}
        </div>
      )}

      {/* Animated progress depth track */}
      <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 18, overflow: 'hidden' }}>
        <div
          style={{
            width: `${countProgress * 100}%`,
            height: '100%',
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};
