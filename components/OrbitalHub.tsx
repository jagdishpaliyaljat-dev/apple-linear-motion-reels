/**
 * OrbitalHub.tsx — Scene 3: Concept Node Diagram
 *
 * Requirements:
 * - Central node "AI AGENT" with subtitle "HARNESS CORE" (accent border, active glow).
 * - 6 satellite nodes: "Code Exec", "Reflection", "Vector RAG", "Prompt Loop", "Tool Interface", "Working Memory".
 * - Node labels: Inter Medium, minimum 30px, auto-width (no truncation, never use "...").
 * - Animation: satellites pop in one by one, 130ms stagger (~4 frames); connector lines draw in with dash-offset (300ms each = 9 frames).
 * - Nodes compact within the safe zone (8% left/right = 86px..994px, 12% top/bottom = 230px..1690px).
 * - Accent color #3B82F6 only.
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface OrbitalHubProps {
  centerLabel?: string;
  centerSublabel?: string;
  satellites?: string[];
  badgeType?: 'plus' | 'dot';
  startFrame?: number;
  cx?: number;
  cy?: number;
  radiusX?: number;
  radiusY?: number;
}

const DEFAULT_SATELLITE_LABELS = [
  'Code Exec',
  'Reflection',
  'Vector RAG',
  'Prompt Loop',
  'Tool Interface',
  'Working Memory',
];

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + rx * Math.cos(rad),
    y: cy + ry * Math.sin(rad),
  };
}

export const OrbitalHub: React.FC<OrbitalHubProps> = ({
  centerLabel = 'AI AGENT',
  centerSublabel = 'HARNESS CORE',
  satellites,
  badgeType = 'dot',
  startFrame = 0,
  cx = 540,
  cy = 1000,
  radiusX = 310,
  radiusY = 230,
}) => {
  const SATELLITE_LABELS = satellites || DEFAULT_SATELLITE_LABELS;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const hubSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const satCount = SATELLITE_LABELS.length;
  const angleStep = 360 / satCount;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        width="1080"
        height="1920"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          <filter id="hub-blue-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dot-blue-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer dashed orbit ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke="rgba(59, 130, 246, 0.22)"
          strokeWidth="2"
          strokeDasharray="8 8"
          opacity={hubSpring}
        />

        {/* Connector lines and traveling blue dots */}
        {SATELLITE_LABELS.map((_, i) => {
          // Fixed orientation for crisp layout inside safe zones
          const angleDeg = i * angleStep - 90;
          const satPos = ellipsePoint(cx, cy, radiusX, radiusY, angleDeg);

          // 130ms stagger = 4 frames per satellite
          const satDelay = 6 + i * 4;
          // Line draw in over 300ms = 9 frames
          const lineP = interpolate(localFrame - satDelay, [0, 9], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const lineLen = Math.hypot(satPos.x - cx, satPos.y - cy);
          const dashOffset = lineLen * (1 - lineP);

          // Traveling pulse dot
          const dotP = ((localFrame + i * 12) % 36) / 36;
          const dotX = cx + (satPos.x - cx) * dotP;
          const dotY = cy + (satPos.y - cy) * dotP;

          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={satPos.x}
                y2={satPos.y}
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2.5"
                strokeDasharray={lineLen}
                strokeDashoffset={dashOffset}
                opacity={lineP}
              />
              {lineP > 0.6 && (
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="5"
                  fill="#60A5FA"
                  filter="url(#dot-blue-glow)"
                />
              )}
            </g>
          );
        })}

        {/* Central blue glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={92}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          filter="url(#hub-blue-glow)"
          opacity={hubSpring}
        />
      </svg>

      {/* Central Node "AI AGENT" with "HARNESS CORE" */}
      <div
        style={{
          position: 'absolute',
          left: cx - 140,
          top: cy - 70,
          width: 280,
          padding: '20px 24px',
          backgroundColor: '#101422',
          borderRadius: 24,
          border: '2.5px solid #3B82F6',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.6), inset 0 0 25px rgba(59, 130, 246, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${hubSpring})`,
          opacity: hubSpring,
          zIndex: 40,
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 32, // min 30px
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          {centerLabel}
        </span>
        {centerSublabel && (
          <span
            style={{
              color: '#60A5FA',
              fontSize: 20,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              marginTop: 6,
              letterSpacing: '0.08em',
            }}
          >
            {centerSublabel}
          </span>
        )}
      </div>

      {/* 6 Satellite Nodes (Inter Medium, min 30px, auto-width, no truncation) */}
      {SATELLITE_LABELS.map((label, i) => {
        const angleDeg = i * angleStep - 90;
        const satPos = ellipsePoint(cx, cy, radiusX, radiusY, angleDeg);

        // 130ms stagger (~4 frames)
        const satDelay = 6 + i * 4;
        const satSpring = spring({
          frame: localFrame - satDelay,
          fps,
          config: { damping: 18, stiffness: 120, mass: 0.8 },
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: satPos.x,
              top: satPos.y,
              transform: `translate(-50%, -50%) scale(${satSpring})`,
              opacity: satSpring,
              backgroundColor: 'rgba(16, 20, 34, 0.96)',
              borderRadius: 18,
              border: '2px solid rgba(59, 130, 246, 0.5)',
              padding: '12px 26px', // auto-width with generous padding
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 24px rgba(59, 130, 246, 0.3)',
              zIndex: 35,
              whiteSpace: 'nowrap', // auto-width, no wrapping, NO truncation
            }}
          >
            {badgeType === 'plus' ? (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  boxShadow: '0 0 10px #3B82F6',
                  flexShrink: 0,
                }}
              />
            )}
            {/* Label: Inter Medium (500), minimum 30px, NO ellipsis, NO truncation */}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 30, // minimum 30px requirement
                fontWeight: 500, // Inter Medium
                color: '#F8FAFC',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
