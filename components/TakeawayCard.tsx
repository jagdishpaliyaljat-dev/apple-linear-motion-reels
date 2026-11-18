/**
 * TakeawayCard.tsx — Scene 6: Takeaway Card
 *
 * Requirements:
 * - Badge: "RECURSIVE AUTONOMY" (min 26px).
 * - Title: "Self-Improving Agent" (48px).
 * - Subtitle: "Optimizes harness prompts and memory automatically" (28px).
 * - Two bottom tags:
 *   1. "Weights Frozen · Zero Retraining" (min 26px).
 *   2. "Open World · Persistent Memory" (min 26px).
 * - Accent color #3B82F6 (blue) only.
 * - Safe zones compliant (width 908px, centered at left: 86px).
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface TakeawayCardProps {
  startFrame?: number;
}

export const TakeawayCard: React.FC<TakeawayCardProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const translateY = interpolate(cardSpring, [0, 1], [15, 0], { extrapolateRight: 'clamp' });
  const motionBlur = interpolate(cardSpring, [0, 0.6, 1], [4, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 86, // 8% safe zone
        width: 908,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        transform: `translateY(${translateY}px) scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring,
      }}
    >
      {/* Top Main Highlight Box (#3B82F6 only) */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#101422',
          borderRadius: 24,
          border: '2.5px solid #3B82F6',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.4), inset 0 0 25px rgba(59, 130, 246, 0.15)',
          padding: '42px 38px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '8px 26px',
            borderRadius: 9999,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1.5px solid #3B82F6',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px requirement
              fontWeight: 800,
              color: '#93C5FD',
              letterSpacing: '0.08em',
            }}
          >
            RECURSIVE AUTONOMY
          </span>
        </div>

        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          Self-Improving Agent
        </div>

        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 28, // min 26px requirement
            color: '#93C5FD',
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          Optimizes harness prompts and memory automatically
        </div>
      </div>

      {/* Two Bottom Tags: "Weights Frozen · Zero Retraining" and "Open World · Persistent Memory" */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(16, 20, 34, 0.95)',
            borderRadius: 18,
            border: '2px solid rgba(59, 130, 246, 0.4)',
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          }}
        >
          <span style={{ fontSize: 26 }}>🔒</span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px requirement
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '0.02em',
            }}
          >
            Weights Frozen · Zero Retraining
          </span>
        </div>

        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(16, 20, 34, 0.95)',
            borderRadius: 18,
            border: '2px solid rgba(59, 130, 246, 0.4)',
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          }}
        >
          <span style={{ fontSize: 26 }}>⚡</span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px requirement
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '0.02em',
            }}
          >
            Open World · Persistent Memory
          </span>
        </div>
      </div>
    </div>
  );
};
