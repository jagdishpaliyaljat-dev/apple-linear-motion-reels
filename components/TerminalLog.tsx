/**
 * TerminalLog — dark streaming terminal with green checks and spinner
 *
 * Section 8.2 & 8.7 compliant:
 * - Width: 960px
 * - 5 real lines from paper
 * - Spinner on active line, check circles on completed
 * - Readable typography for vertical video
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

type LineStatus = 'done' | 'active' | 'pending';

interface LogLine {
  text: string;
  status: LineStatus;
  rightText?: string;
}

interface TerminalLogProps {
  toolName: string;
  metaPills?: string[];
  logs: LogLine[];
  finalMetric?: string;
  startFrame?: number;
  revealEvery?: number;
  width?: number;
  style?: React.CSSProperties;
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const TerminalLog: React.FC<TerminalLogProps> = ({
  toolName,
  metaPills = [],
  logs,
  finalMetric,
  startFrame = 0,
  revealEvery = 8,
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
  const translateY = interpolate(cardSpring, [0, 1], [8, 0], { extrapolateRight: 'clamp' });
  const motionBlur = interpolate(cardSpring, [0, 0.6, 1], [4, 1, 0], { extrapolateRight: 'clamp' });

  // How many lines are visible
  const visibleLines = Math.min(logs.length, Math.floor(localFrame / revealEvery) + 1);

  // Spinner state
  const spinnerIdx = Math.floor(localFrame / 3) % SPINNER_FRAMES.length;
  const spinnerChar = SPINNER_FRAMES[spinnerIdx];

  return (
    <div
      style={{
        width,
        backgroundColor: '#0E1424',
        borderRadius: 18,
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(56,189,248,0.1)',
        overflow: 'hidden',
        transform: `translateY(${translateY}px) scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring,
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          backgroundColor: '#080E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 15,
            color: '#38BDF8',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          {toolName}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {metaPills.map((p, i) => (
            <span
              key={i}
              style={{
                padding: '4px 12px',
                borderRadius: 9999,
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#94A3B8',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Log lines */}
      <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {logs.slice(0, visibleLines).map((line, idx) => {
          const isActive = line.status === 'active' && idx === visibleLines - 1;
          const lineReveal = spring({
            frame: localFrame - idx * revealEvery,
            fps,
            config: { damping: 18, stiffness: 150, mass: 0.7 },
          });

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: lineReveal,
                transform: `translateX(${interpolate(lineReveal, [0, 1], [-8, 0])}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isActive ? (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 17,
                      color: '#38BDF8',
                      width: 20,
                      display: 'inline-block',
                    }}
                  >
                    {spinnerChar}
                  </span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7.5" stroke="#10B981" strokeWidth="1.2" />
                    <path d="M4.5 8L7 10.5L11.5 6" stroke="#10B981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 17,
                    color: isActive ? '#F1F5F9' : '#94A3B8',
                    lineHeight: 1.5,
                  }}
                >
                  {line.text}
                </span>
              </div>
              {line.rightText && (
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748B' }}>
                  {line.rightText}
                </span>
              )}
            </div>
          );
        })}

        {/* Final metric line */}
        {finalMetric && visibleLines >= logs.length && (
          <div
            style={{
              marginTop: 10,
              padding: '14px 18px',
              backgroundColor: 'rgba(16,185,129,0.12)',
              borderRadius: 12,
              border: '1px solid rgba(16,185,129,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#10B981',
              }}
            >
              {finalMetric}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
