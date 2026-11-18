/**
 * LineChart.tsx — Scene 5: Light Scene Performance Scaling Chart
 *
 * Requirements:
 * - White chart card on light background (#EDECE8).
 * - Title "PERFORMANCE SCALING" in Inter Bold.
 * - x-axis labels: Base, Claude, Gemini, Harness² (min 26px).
 * - y-axis labels visible (e.g. 30, 45, 60, 75 - min 26px).
 * - Legend at bottom: Harness² (blue solid #3B82F6), Direct Prompt (slate dashed #64748B).
 * - Line draws on over 1.2s (36 frames); endpoint dot pulses once (max scale 1.15).
 * - All labels minimum 26px typography.
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface LineChartProps {
  startFrame?: number;
}

// Chart SVG paths
const SOLID_PATH = 'M 110 210 C 240 190, 380 150, 520 100 C 660 50, 740 28, 810 16';
const DASHED_PATH = 'M 110 230 C 240 215, 380 195, 520 170 C 660 145, 740 130, 810 115';
const PATH_LENGTH = 820;

export const LineChart: React.FC<LineChartProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const motionBlur = interpolate(cardSpring, [0, 0.6, 1], [4, 1, 0], { extrapolateRight: 'clamp' });

  // Line draws on over 1.2s = 36 frames starting at 20.0s (localFrame 30)
  const drawProgress = interpolate(localFrame, [30, 66], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const dashOffset = PATH_LENGTH * (1 - drawProgress);

  // Endpoint dot pulses once (max scale 1.15) after draw finishes (around frame 66 to 80)
  const pulseP = interpolate(localFrame, [66, 73, 80], [1.0, 1.15, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dotOpacity = interpolate(localFrame, [64, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const svgW = 860;
  const svgH = 270;

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 86, // 8% safe zone
        width: 908,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        border: '2px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)',
        padding: '44px 30px',
        transform: `scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring,
      }}
    >
      {/* Top Title: "PERFORMANCE SCALING" & Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: '0 12px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 28, // min 26px
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          PERFORMANCE SCALING
        </span>

        <div
          style={{
            padding: '6px 18px',
            borderRadius: 9999,
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1.5px solid #3B82F6',
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, color: '#2563EB' }}>
            v9
          </span>
        </div>
      </div>

      {/* SVG Chart with Y-axis & X-axis */}
      <svg
        width={svgW}
        height={svgH + 40}
        viewBox={`0 0 ${svgW} ${svgH + 40}`}
        fill="none"
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
      >
        <defs>
          <filter id="blue-line-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="blue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-axis Labels (visible, min 26px): 30, 45, 60, 75 */}
        {[
          { val: '75', y: 25 },
          { val: '60', y: 95 },
          { val: '45', y: 165 },
          { val: '30', y: 235 },
        ].map((item, idx) => (
          <g key={idx}>
            <text
              x={50}
              y={item.y}
              fill="#94A3B8"
              fontSize="26" // min 26px requirement
              fontWeight="600"
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="end"
            >
              {item.val}
            </text>
            <line
              x1={65}
              y1={item.y - 6}
              x2={810}
              y2={item.y - 6}
              stroke="rgba(0, 0, 0, 0.05)"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Gradient fill under blue curve */}
        <path
          d={`${SOLID_PATH} L 810 ${svgH} L 110 ${svgH} Z`}
          fill="url(#blue-fill)"
          opacity={drawProgress * 0.9}
        />

        {/* Dashed baseline curve */}
        <path
          d={DASHED_PATH}
          stroke="#64748B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="8 6"
          strokeDashoffset={dashOffset * 0.9}
          opacity={drawProgress}
        />

        {/* Solid superior curve (Blue #3B82F6 only) */}
        <path
          d={SOLID_PATH}
          stroke="#3B82F6"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
          filter="url(#blue-line-glow)"
        />

        {/* End dot with single pulse (max scale 1.15) */}
        <g transform={`translate(810, 16) scale(${pulseP}) translate(-810, -16)`}>
          <circle cx={810} cy={16} r={10} fill="#3B82F6" opacity={dotOpacity} />
          <circle cx={810} cy={16} r={5} fill="#FFFFFF" opacity={dotOpacity} />
        </g>

        {/* X-axis labels (min 26px): Base, Claude, Gemini, Harness² */}
        {['Base', 'Claude', 'Gemini', 'Harness²'].map((label, i) => {
          const x = 110 + (i / 3) * (810 - 110);
          return (
            <text
              key={i}
              x={x}
              y={svgH + 34}
              textAnchor="middle"
              fill={i === 3 ? '#2563EB' : '#475569'}
              fontSize="26" // min 26px requirement
              fontWeight={i === 3 ? '800' : '600'}
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend at bottom (min 26px) */}
      <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 6, backgroundColor: '#3B82F6', borderRadius: 3 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 800, color: '#111111' }}>
            Harness²
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="34" height="6">
            <line x1="0" y1="3" x2="34" y2="3" stroke="#64748B" strokeWidth="3" strokeDasharray="6 4" />
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600, color: '#64748B' }}>
            Direct Prompt
          </span>
        </div>
      </div>
    </div>
  );
};
