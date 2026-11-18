/**
 * ProofMetricCard.tsx — Scene 4: Proof
 *
 * Requirements:
 * - Card label: "OVERALL EVALUATION SCORE" in Inter SemiBold, all caps, letter-spacing +8%, minimum 28px.
 * - Big number: "61.2" in Inter Bold, minimum 160px (set to 168px), accent blue #3B82F6.
 * - Sub-line: "+11.8 pts over baseline direct prompt" (min 28px).
 * - Number counts up from 0.0 to 61.2 over 900ms (27 frames), ease-out.
 * - Thin progress bar under number fills in sync with count-up.
 * - This is the ONLY full display of the 61.2 card in the video.
 * - Safe zones compliant (width 908px, centered at left: 86px).
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface ProofMetricCardProps {
  startFrame?: number;
}

export const ProofMetricCard: React.FC<ProofMetricCardProps> = ({ startFrame = 0 }) => {
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

  // Count-up: 0.0 -> 61.2 over 900ms = 27 frames
  const countProgress = interpolate(localFrame, [0, 27], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const liveScore = (61.2 * countProgress).toFixed(1);

  // Soft expanding blue pulse wave
  const pulseCycle = (localFrame % 35) / 35;
  const pulseScale = interpolate(pulseCycle, [0, 1], [0.96, 1.25]);
  const pulseOpacity = interpolate(pulseCycle, [0, 0.3, 1], [0.5, 0.15, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 86, // 8% safe zone
        width: 908,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Expanding blue pulse wave */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 28,
          border: '2px solid #3B82F6',
          transform: `scale(${pulseScale})`,
          opacity: pulseOpacity,
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.4)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Metric Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#101422',
          borderRadius: 26,
          border: '2.5px solid #3B82F6',
          boxShadow: '0 0 80px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.2)',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${translateY}px) scale(${cardSpring})`,
          filter: `blur(${motionBlur}px)`,
          opacity: cardSpring,
          zIndex: 10,
        }}
      >
        {/* Card Label: Inter SemiBold, all caps, letter-spacing +8%, minimum 28px */}
        <div
          style={{
            padding: '10px 32px',
            borderRadius: 9999,
            backgroundColor: 'rgba(59, 130, 246, 0.18)',
            border: '2px solid #3B82F6',
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 28, // minimum 28px requirement
              fontWeight: 600, // Inter SemiBold
              color: '#93C5FD',
              letterSpacing: '0.08em', // letter-spacing +8%
              textTransform: 'uppercase',
            }}
          >
            OVERALL EVALUATION SCORE
          </span>
        </div>

        {/* Big Number: 61.2 in Inter Bold, minimum 160px (set to 168px), accent blue */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 168, // minimum 160px requirement
            fontWeight: 800, // Inter Bold
            color: '#3B82F6', // Accent blue #3B82F6
            lineHeight: 1,
            margin: '16px 0',
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 70px rgba(59, 130, 246, 0.75)',
          }}
        >
          {liveScore}
        </div>

        {/* Sub-line: "+11.8 pts over baseline direct prompt" */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 28, // >= 26px
            fontWeight: 700,
            color: '#F8FAFC',
            textAlign: 'center',
            marginTop: 6,
            letterSpacing: '-0.01em',
          }}
        >
          +11.8 pts over baseline direct prompt
        </div>

        {/* Thin progress bar fills in sync with count-up */}
        <div
          style={{
            width: '100%',
            height: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: 3,
            marginTop: 36,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${countProgress * 100}%`,
              height: '100%',
              backgroundColor: '#3B82F6',
              boxShadow: '0 0 16px #3B82F6',
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
};
