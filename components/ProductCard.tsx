/**
 * ProductCard.tsx — Scene 2: Product Reveal Browser-Window Card
 *
 * Requirements:
 * - Browser-window card: URL "google-research/harness2", title "Harness²", subtitle "Recursive Agent Harnessing Framework"
 * - Pills: "● OPEN SOURCE" and "APACHE 2.0"
 * - Card enters with a 400ms (12 frames) slide-in + scale 0.96 to 1
 * - Accent color #3B82F6 only.
 * - Labels minimum 26px typography.
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface ProductCardProps {
  startFrame?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // 400ms slide-in + scale 0.96 to 1
  const entranceProgress = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardScale = interpolate(entranceProgress, [0, 1], [0.96, 1.0]);
  const translateY = interpolate(entranceProgress, [0, 1], [24, 0]);
  const cardOpacity = entranceProgress;

  return (
    <div
      style={{
        position: 'absolute',
        top: 540,
        left: 86, // 8% safe zone
        width: 908,
        backgroundColor: '#101422',
        borderRadius: 24,
        border: '2px solid rgba(59, 130, 246, 0.45)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(${translateY}px) scale(${cardScale})`,
        opacity: cardOpacity,
      }}
    >
      {/* Browser Window Header Bar with URL */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#0A0E1A',
          padding: '16px 24px',
          borderBottom: '1.5px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Subtle window dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27272A' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27272A' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27272A' }} />
        </div>

        {/* URL Address Bar */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#141A2E',
            borderRadius: 10,
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18, color: '#60A5FA' }}>🔒</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 26, // min 26px requirement
              color: '#93C5FD',
              fontWeight: 600,
            }}
          >
            google-research/harness2
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div
        style={{
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Big Product Name */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 82,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 20,
            textShadow: '0 0 40px rgba(59, 130, 246, 0.35)',
          }}
        >
          Harness²
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 28, // >= 26px
            color: '#93C5FD',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: 36,
          }}
        >
          Recursive Agent Harnessing Framework
        </div>

        {/* Pills: "● OPEN SOURCE" and "APACHE 2.0" */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div
            style={{
              padding: '12px 28px',
              borderRadius: 9999,
              backgroundColor: 'rgba(59, 130, 246, 0.18)',
              border: '2px solid #3B82F6',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 26, // min 26px
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
              }}
            >
              ● OPEN SOURCE
            </span>
          </div>

          <div
            style={{
              padding: '12px 28px',
              borderRadius: 9999,
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 26, // min 26px
                fontWeight: 700,
                color: '#93C5FD',
                letterSpacing: '0.04em',
              }}
            >
              APACHE 2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
