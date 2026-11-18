import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export interface HeroBadge3DProps {
  startFrame?: number;
}

export const HeroBadge3D: React.FC<HeroBadge3DProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // High-impact spring entrance
  const heroScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Dynamic 3D perspective tilt (continuous micro-motion)
  const tiltX = Math.sin(localFrame / 22) * 9;
  const tiltY = Math.cos(localFrame / 26) * 11;

  const glowPulse = interpolate(Math.sin(localFrame / 16), [-1, 1], [0.45, 0.85]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 540,
        left: 80,
        width: 920,
        height: 600,
        padding: '60px 48px',
        backgroundColor: 'rgba(20, 20, 24, 0.92)',
        backdropFilter: 'blur(30px)',
        borderRadius: 20,
        border: '2px solid #2563EB',
        boxShadow: `0 0 90px rgba(37, 99, 235, ${glowPulse}), inset 0 0 40px rgba(37, 99, 235, 0.25)`,
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${heroScale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        zIndex: 25,
      }}
    >
      {/* Top Category Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 26px',
          borderRadius: 9999,
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          border: '1px solid rgba(37, 99, 235, 0.5)',
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 12px #38BDF8' }} />
        <span
          style={{
            color: '#BFDBFE',
            fontWeight: 800,
            fontSize: 17,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          NEXT-GEN ARCHITECTURE
        </span>
      </div>

      {/* Main Impact Hero Word */}
      <div
        style={{
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontSize: 96,
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          textShadow: '0 0 40px rgba(56, 189, 248, 0.65)',
        }}
      >
        AGENTIC
      </div>

      {/* Subtitle description */}
      <div style={{ color: '#A1A1AA', fontSize: 22, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
        AUTONOMOUS • SECURE • FRAME-DETERMINISTIC
      </div>

      {/* Triad Metric Pills */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#93C5FD',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
              boxShadow: '0 0 10px #38BDF8',
              flexShrink: 0,
            }}
          />
          <span>AUTONOMOUS</span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#34D399',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              flexShrink: 0,
            }}
          />
          <span>SAST AUDITED</span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#F472B6',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#F472B6',
              boxShadow: '0 0 10px #F472B6',
              flexShrink: 0,
            }}
          />
          <span>60FPS CRAFT</span>
        </div>
      </div>
    </div>
  );
};
