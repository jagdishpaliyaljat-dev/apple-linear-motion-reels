import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export interface OrbitalNodeDiagramProps {
  startFrame?: number;
}

export const OrbitalNodeDiagram: React.FC<OrbitalNodeDiagramProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Central hub spring entry
  const centerScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Breathing hub pulse & rotation
  const hubBreathing = interpolate(Math.sin(localFrame / 18), [-1, 1], [0.97, 1.03]);
  const glowOpacity = interpolate(Math.sin(localFrame / 15), [-1, 1], [0.5, 0.9]);

  const centerX = 470;
  const centerY = 480;

  // 3 Satellite Nodes orbiting the hub
  const satellites = [
    {
      label: 'Memory',
      badge: 'Vector DB',
      targetX: 180,
      targetY: 150,
      color: '#A78BFA',
      delay: 4,
    },
    {
      label: 'Tools',
      badge: 'APIs & Web',
      targetX: 760,
      targetY: 150,
      color: '#38BDF8',
      delay: 10,
    },
    {
      label: 'Skills',
      badge: 'SAST & Rules',
      targetX: 470,
      targetY: 810,
      color: '#34D399',
      delay: 16,
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 70,
        width: 940,
        height: 980,
      }}
    >
      {/* SVG Connecting Paths with dynamic dash flows and moving light pulses */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="orbitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
          </linearGradient>
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines draw DIRECTLY from Central Hub (centerX, centerY) to each of the 3 nodes */}
        {satellites.map((sat, i) => {
          const pathProgress = spring({
            frame: localFrame - sat.delay,
            fps,
            config: { damping: 14, stiffness: 140 },
          });

          // Continuous floating displacement
          const satFloatY = Math.sin((localFrame + i * 40) / 18) * 8;
          const satFloatX = Math.cos((localFrame + i * 40) / 24) * 6;

          const currentX = centerX + (sat.targetX + satFloatX - centerX) * pathProgress;
          const currentY = centerY + (sat.targetY + satFloatY - centerY) * pathProgress;

          // Moving packet pulse along the connector line (0 to 1 looping)
          const pulseT = ((localFrame * 0.025 + i * 0.33) % 1);
          const pulseX = centerX + (currentX - centerX) * pulseT;
          const pulseY = centerY + (currentY - centerY) * pulseT;

          return (
            <g key={i}>
              {/* Outer soft glow line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={currentX}
                y2={currentY}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Animated Dashed Flow Connector from Central Hub to Node */}
              <line
                x1={centerX}
                y1={centerY}
                x2={currentX}
                y2={currentY}
                stroke="url(#orbitalGrad)"
                strokeWidth="3"
                strokeDasharray="9 9"
                strokeDashoffset={-localFrame * 2.8}
                strokeLinecap="round"
              />
              {/* Traveling Light Pulse Packet */}
              {localFrame > sat.delay + 8 && (
                <circle
                  cx={pulseX}
                  cy={pulseY}
                  r="6"
                  fill="#93C5FD"
                  filter="url(#pulseGlow)"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Central Glowing Hub: "AI Agent" */}
      <div
        style={{
          position: 'absolute',
          left: centerX - 105,
          top: centerY - 105,
          width: 210,
          height: 210,
          borderRadius: '50%',
          backgroundColor: 'rgba(20, 20, 24, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: `0 0 80px rgba(37, 99, 235, ${glowOpacity}), inset 0 0 35px rgba(37, 99, 235, 0.35)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${centerScale * hubBreathing})`,
          zIndex: 20,
        }}
      >
        {/* Rotating Dashed Inner Reticle */}
        <div
          style={{
            position: 'absolute',
            width: 178,
            height: 178,
            borderRadius: '50%',
            border: '1.5px dashed rgba(96, 165, 250, 0.7)',
            transform: `rotate(${localFrame * 0.95}deg)`,
          }}
        />

        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#38BDF8',
            boxShadow: '0 0 16px #38BDF8',
            marginBottom: 8,
          }}
        />
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 28,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.03em',
            textAlign: 'center',
          }}
        >
          AI Agent
        </span>
        <span
          style={{
            color: '#93C5FD',
            fontWeight: 700,
            fontSize: 13,
            fontFamily: 'monospace',
            letterSpacing: '0.14em',
            marginTop: 4,
            textTransform: 'uppercase',
          }}
        >
          AUTONOMOUS
        </span>
      </div>

      {/* Satellite Floating Glassmorphic Pill Badges (Memory, Tools, Skills) */}
      {satellites.map((sat, i) => {
        const satSpring = spring({
          frame: localFrame - sat.delay,
          fps,
          config: { damping: 14, stiffness: 140 },
        });

        // Continuous sinusoidal floating drift
        const floatY = Math.sin((localFrame + i * 40) / 18) * 8;
        const floatX = Math.cos((localFrame + i * 40) / 24) * 6;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: sat.targetX - 135 + floatX,
              top: sat.targetY - 48 + floatY,
              minWidth: 270,
              padding: '18px 28px',
              backgroundColor: 'rgba(20, 20, 24, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 9999,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 28px rgba(37, 99, 235, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              transform: `scale(${satSpring})`,
              opacity: satSpring,
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: sat.color,
                  boxShadow: `0 0 14px ${sat.color}`,
                }}
              />
              <span
                style={{
                  color: '#F4F4F5',
                  fontSize: 25,
                  fontWeight: 700,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {sat.label}
              </span>
            </div>

            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '5px 12px',
                borderRadius: 8,
                color: '#A1A1AA',
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {sat.badge}
            </span>
          </div>
        );
      })}
    </div>
  );
};
