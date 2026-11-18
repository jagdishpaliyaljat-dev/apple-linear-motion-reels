/**
 * HeroLogoRing.tsx — Scene 1: Hook
 *
 * Requirements:
 * - Google logo centered in a thin ring.
 * - Subtle dot particles (max 6).
 * - Ring rotates very slowly (1 rotation in 20s = 600 frames).
 * - Badge pill above: "NEW · JUST RELEASED" (accent border).
 * - Footer tag below: "GOOGLE RESEARCH · AI HARNESS" (26px min).
 * - Accent color #3B82F6 only.
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  phase: number;
}

function generateParticles(count: number, cx: number, cy: number): Particle[] {
  // Max 6 subtle particles in blue accent variations
  const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#3B82F6', '#60A5FA'];
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 230 + Math.sin(i * 1.7) * 40;
    particles.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      size: 6,
      color: colors[i % colors.length],
      speed: 0.02 + (i % 3) * 0.01,
      phase: i * 1.1,
    });
  }
  return particles;
}

interface HeroLogoRingProps {
  logoSrc?: string;
  topBadge?: string;
  footerTag?: string;
  startFrame?: number;
  cx?: number;
  cy?: number;
}

export const HeroLogoRing: React.FC<HeroLogoRingProps> = ({
  logoSrc,
  topBadge = 'NEW · JUST RELEASED',
  footerTag = 'GOOGLE RESEARCH · AI HARNESS',
  startFrame = 0,
  cx = 540,
  cy = 920,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const hubSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.9 },
  });
  const badgeSpring = spring({
    frame: localFrame - 6,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const footerSpring = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  // Exactly 6 subtle dot particles (rule: max 6)
  const particles = generateParticles(6, cx, cy);
  const ringRadius = 180;

  // Ring rotates very slowly: 1 rotation in 20s (600 frames)
  const ringRotation = (localFrame / 600) * 360;

  // Pulse glow cycle
  const waveCycle = (localFrame % 30) / 30;
  const waveScale = interpolate(waveCycle, [0, 1], [1.0, 1.35]);
  const waveOpacity = interpolate(waveCycle, [0, 0.3, 1], [0.6, 0.2, 0]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Background blue radial glow */}
      <div
        style={{
          position: 'absolute',
          left: cx - 280,
          top: cy - 280,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)',
          opacity: hubSpring,
          filter: 'blur(25px)',
        }}
      />

      {/* 6 subtle drifting particles */}
      {particles.map((p, i) => {
        const pSpring = spring({ frame: localFrame - 2 - i, fps, config: { damping: 20, stiffness: 100, mass: 0.6 } });
        const driftX = Math.sin(localFrame * p.speed + p.phase) * 14;
        const driftY = Math.cos(localFrame * p.speed * 0.8 + p.phase) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x + driftX - p.size / 2,
              top: p.y + driftY - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: pSpring * 0.75,
              boxShadow: `0 0 14px ${p.color}`,
            }}
          />
        );
      })}

      {/* SVG Ring with slow 20s rotation */}
      <svg
        width="1080"
        height="1920"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          transform: `rotate(${ringRotation}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        <defs>
          <filter id="hero-blue-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Expanding blue wave */}
        <circle
          cx={cx}
          cy={cy}
          r={ringRadius * waveScale}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.5"
          opacity={waveOpacity}
        />

        {/* Outer thin ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.5"
          filter="url(#hero-blue-glow)"
          opacity={hubSpring}
        />

        {/* Inner thin blue ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ringRadius - 12}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          opacity={hubSpring * 0.75}
        />
      </svg>

      {/* Google Vector Logo */}
      <div
        style={{
          position: 'absolute',
          left: cx - 110,
          top: cy - 110,
          width: 220,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${hubSpring})`,
          opacity: hubSpring,
        }}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Google Logo"
            style={{ width: 170, height: 170, objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 90, fontWeight: 900, color: '#3B82F6' }}>G</span>
        )}
      </div>

      {/* Badge pill above: "NEW · JUST RELEASED" (accent border) */}
      <div
        style={{
          position: 'absolute',
          left: cx - 260,
          top: cy - ringRadius - 90,
          width: 520,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${badgeSpring}) translateY(${interpolate(badgeSpring, [0, 1], [-8, 0])}px)`,
          opacity: badgeSpring,
        }}
      >
        <div
          style={{
            padding: '10px 28px',
            borderRadius: 9999,
            backgroundColor: 'rgba(59, 130, 246, 0.16)',
            border: '2px solid #3B82F6',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px
              fontWeight: 800,
              color: '#93C5FD',
              letterSpacing: '0.08em',
            }}
          >
            {topBadge}
          </span>
        </div>
      </div>

      {/* Footer tag below: "GOOGLE RESEARCH · AI HARNESS" (26px min) */}
      <div
        style={{
          position: 'absolute',
          left: 86,
          top: cy + ringRadius + 60,
          width: 908,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${footerSpring}) translateY(${interpolate(footerSpring, [0, 1], [8, 0])}px)`,
          opacity: footerSpring,
        }}
      >
        <div
          style={{
            padding: '12px 34px',
            borderRadius: 9999,
            backgroundColor: 'rgba(16, 20, 34, 0.95)',
            border: '2px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
            }}
          >
            {footerTag}
          </span>
        </div>
      </div>
    </div>
  );
};
