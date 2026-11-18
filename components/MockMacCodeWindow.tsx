import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CodeLine {
  num: number;
  text: string;
  color: string;
}

export interface MockMacCodeWindowProps {
  startFrame?: number;
  filename?: string;
  badge?: string;
  lines?: CodeLine[];
}

export const MockMacCodeWindow: React.FC<MockMacCodeWindowProps> = ({
  startFrame = 0,
  filename = 'agent.ts',
  badge = 'NEW • JUST RELEASED',
  lines: customLines,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Crisp spring entry
  const cardScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Continuous micro-floating (continuous 60fps life)
  const floatY = Math.sin(localFrame / 22) * 7;
  const cursorBlink = Math.floor(localFrame / 14) % 2 === 0;

  const lines = customLines ?? [
    { num: 1, text: '// Autonomous Agent Runtime v2.5', color: '#71717A' },
    { num: 2, text: 'import { AIAgent } from "@agency/core";', color: '#60A5FA' },
    { num: 3, text: 'const agent = new AIAgent({', color: '#E4E4E7' },
    { num: 4, text: '  mode: "autonomous",', color: '#F472B6' },
    { num: 5, text: '  memory: "episodic",', color: '#F472B6' },
    { num: 6, text: '  tools: ["web", "code"],', color: '#34D399' },
    { num: 7, text: '});', color: '#E4E4E7' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 500 + floatY,
        left: 60,
        width: 960,
        height: 740,
        backgroundColor: 'rgba(20, 20, 24, 0.88)',
        backdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(37, 99, 235, 0.2)',
        overflow: 'hidden',
        transform: `scale(${cardScale})`,
        opacity: cardScale,
        zIndex: 20,
      }}
    >
      {/* Title Bar with Traffic Lights */}
      <div
        style={{
          height: 68,
          backgroundColor: '#0C0C0F',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          <span
            style={{
              marginLeft: 20,
              color: '#A1A1AA',
              fontSize: 19,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontWeight: 500,
            }}
          >
            {filename}
          </span>
        </div>

        {/* Live Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(37, 99, 235, 0.45)',
            borderRadius: 9999,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
          <span
            style={{
              color: '#BFDBFE',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        </div>
      </div>

      {/* Code Editor Body with Line-by-Line Reveal & Blinking Cursor */}
      <div
        style={{
          padding: '40px 44px',
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
          fontSize: 27,
          lineHeight: 1.85,
        }}
      >
        {lines.map((line, idx) => {
          const lineReveal = spring({
            frame: localFrame - 8 - idx * 8,
            fps,
            config: { damping: 14, stiffness: 140 },
          });

          const isCurrentActiveLine = localFrame >= 8 + idx * 8 && localFrame < 8 + (idx + 1) * 8;
          const isLastLine = idx === lines.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 28,
                opacity: lineReveal,
                transform: `translateX(${(1 - lineReveal) * -18}px)`,
              }}
            >
              <span style={{ color: '#52525B', width: 36, textAlign: 'right', userSelect: 'none' }}>
                {line.num}
              </span>
              <span style={{ color: line.color }}>
                {line.text}
                {((isCurrentActiveLine || (isLastLine && localFrame >= 8 + idx * 8)) && cursorBlink) && (
                  <span style={{ color: '#38BDF8', fontWeight: 800 }}> |</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
