/**
 * CodeEditor — dark code editor with syntax colors, active line highlight & blinking caret
 *
 * Features:
 * - Line numbers (greyed out)
 * - Highlighted active line with blue tint background
 * - Blinking cursor caret at end of current typing line
 * - Bottom status bar with manual edits, time, score
 *
 * Usage:
 *   <CodeEditor
 *     filename="agent_harness.py"
 *     lines={[
 *       "import harness2 as h2",
 *       "from harness2.eval import benchmark",
 *       "agent = h2.Agent(model='gemini-1.5-pro')",
 *       "results = agent.run_parallel(tasks, k=1)",
 *       "score = benchmark.evaluate(results)",
 *     ]}
 *     activeLineIndex={3}
 *     footerMeta="manual edits 42 · 3h 14m · score 61.2"
 *     startFrame={0}
 *   />
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface CodeEditorProps {
  filename?: string;
  lines: string[];
  activeLineIndex?: number;
  footerMeta?: string;
  startFrame?: number;
  width?: number;
  style?: React.CSSProperties;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filename = 'agent_harness.py',
  lines,
  activeLineIndex = 3,
  footerMeta = 'manual edits 42 · 3h 14m · score 61.2',
  startFrame = 0,
  width = 920,
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

  // Caret blink (15 frames cycle)
  const caretVisible = Math.floor(localFrame / 15) % 2 === 0;

  return (
    <div
      style={{
        width,
        backgroundColor: '#0C0D12',
        borderRadius: 18,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(37, 99, 235, 0.12)',
        overflow: 'hidden',
        transform: `translateY(${translateY}px) scale(${cardSpring})`,
        filter: `blur(${motionBlur}px)`,
        opacity: cardSpring,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {/* Title / Tab bar */}
      <div
        style={{
          height: 48,
          backgroundColor: '#07080A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          <span
            style={{
              marginLeft: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13,
              color: '#A1A1AA',
            }}
          >
            {filename}
          </span>
        </div>
        <div
          style={{
            padding: '3px 10px',
            borderRadius: 9999,
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(37, 99, 235, 0.4)',
          }}
        >
          <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: '#93C5FD' }}>
            PYTHON 3.11
          </span>
        </div>
      </div>

      {/* Code Area */}
      <div
        style={{
          padding: '24px 28px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 18,
          lineHeight: 1.8,
        }}
      >
        {lines.map((line, idx) => {
          const lineReveal = spring({
            frame: localFrame - 8 - idx * 6,
            fps,
            config: { damping: 18, stiffness: 140, mass: 0.8 },
          });

          const isCurrentActive = idx === activeLineIndex;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isCurrentActive ? 'rgba(37, 99, 235, 0.16)' : 'transparent',
                borderLeft: isCurrentActive ? '3px solid #38BDF8' : '3px solid transparent',
                padding: '2px 8px',
                borderRadius: 4,
                opacity: lineReveal,
                transform: `translateX(${interpolate(lineReveal, [0, 1], [-12, 0])}px)`,
              }}
            >
              <span
                style={{
                  width: 34,
                  color: isCurrentActive ? '#38BDF8' : '#52525B',
                  userSelect: 'none',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <span style={{ color: isCurrentActive ? '#FFFFFF' : '#D4D4D8' }}>
                {line}
              </span>
              {isCurrentActive && caretVisible && (
                <span style={{ color: '#38BDF8', fontWeight: 800, marginLeft: 2 }}>|</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Status Bar */}
      <div
        style={{
          height: 38,
          backgroundColor: '#07080A',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#71717A' }}>
          {footerMeta}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#10B981', fontWeight: 700 }}>
          ● LIVE RUNTIME
        </span>
      </div>
    </div>
  );
};
