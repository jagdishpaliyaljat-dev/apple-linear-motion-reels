/**
 * BrowserWindow — Light-theme browser card with real URL bar
 *
 * Section 8.2 & 8.7 compliant:
 * - Width >= 88% (960px)
 * - Real landing page metadata and URL bar
 * - Traffic lights, smooth entrance spring
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface BrowserWindowProps {
  url: string;
  favicon?: React.ReactNode;
  children?: React.ReactNode;
  startFrame?: number;
  scrollY?: number;
  width?: number;
  style?: React.CSSProperties;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  url,
  favicon,
  children,
  startFrame = 0,
  scrollY = 0,
  width = 960,
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

  const motionBlur = interpolate(cardSpring, [0, 0.6, 1], [4, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(cardSpring, [0, 1], [8, 0], {
    extrapolateRight: 'clamp',
  });

  const contentPanY = interpolate(localFrame, [0, 90], [0, -scrollY], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        transform: `translateY(${translateY}px) scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring,
        willChange: 'transform, filter',
        ...style,
      }}
    >
      {/* Chrome toolbar */}
      <div
        style={{
          height: 56,
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 14,
        }}
      >
        {/* Traffic dots */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#27C93F' }} />
        </div>

        {/* Centered URL pill */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#ECEFF1',
              borderRadius: 8,
              padding: '6px 16px',
              maxWidth: 520,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {favicon || (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
                color: '#374151',
                fontWeight: 600,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {url}
            </span>
          </div>
        </div>

        {/* Right spacer */}
        <div style={{ width: 60, flexShrink: 0 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          overflow: 'hidden',
          transform: `translateY(${contentPanY}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
