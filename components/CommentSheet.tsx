/**
 * CommentSheet — Dark bottom-up comment CTA sheet with real discussions & interactive Post button
 *
 * Section 8.2 & 8.6 compliant:
 * - Height: 55–60% of vertical canvas (~1080px)
 * - 2 real discussion rows (Tomas Pfister, Ruiyao Xu)
 * - Input box with clickable Post button
 */

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface CommentSheetProps {
  title?: string;
  placeholder?: string;
  buttonLabel?: string;
  buttonActive?: boolean;
  startFrame?: number;
  width?: number;
  style?: React.CSSProperties;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({
  title = 'Comments',
  placeholder = 'Add a comment on Harness²...',
  buttonLabel = 'Post',
  buttonActive = false,
  startFrame = 0,
  width = 960,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  const sheetSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const translateY = interpolate(sheetSpring, [0, 1], [60, 0], { extrapolateRight: 'clamp' });
  const motionBlur = interpolate(sheetSpring, [0, 0.6, 1], [4, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width,
        height: 1050,
        backgroundColor: '#0F121C',
        borderRadius: '26px 26px 0 0',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderBottom: 'none',
        boxShadow: '0 -20px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(37, 99, 235, 0.15)',
        padding: '28px 38px',
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(${translateY}px)`,
        filter: `blur(${motionBlur}px)`,
        opacity: sheetSpring,
        willChange: 'transform, opacity',
        position: 'relative',
        ...style,
      }}
    >
      {/* Grab bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 900, color: '#FAFAFA' }}>
            {title}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#64748B', fontWeight: 600 }}>
            (128)
          </span>
        </div>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#38BDF8',
            padding: '5px 14px',
            borderRadius: 9999,
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontWeight: 700,
          }}
        >
          OPEN DISCUSSION
        </span>
      </div>

      {/* Discussion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
        {/* Comment 1: Tomas Pfister */}
        <div
          style={{
            padding: '18px 22px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                TP
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
                Personal Examiner System
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                Author
              </span>
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B' }}>Just now</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 15, color: '#94A3B8', lineHeight: 1.5 }}>
            AI Examiner Prompt chahiye? Niche comment me 'EXAM' likho, main turant prompt aur grading rubric aapko DM me send kar dunga!
          </div>
        </div>

        {/* Comment 2: Roediger & Karpicke */}
        <div
          style={{
            padding: '18px 22px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                RK
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
                Roediger & Karpicke
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                Science 2006
              </span>
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B' }}>Verified</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 15, color: '#94A3B8', lineHeight: 1.5 }}>
            Active recall testing gives 61% long-term retention vs 34% passive reading. Socratic interrogation works!
          </div>
        </div>
      </div>

      {/* Input Box Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#07090F',
          borderRadius: 16,
          border: buttonActive ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
          padding: '10px 14px 10px 20px',
          gap: 14,
          position: 'relative',
        }}
      >
        <div style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#94A3B8' }}>
          {placeholder}
        </div>
        <button
          style={{
            padding: '14px 28px',
            borderRadius: 12,
            backgroundColor: buttonActive ? '#10B981' : '#2563EB',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 800,
            border: 'none',
            boxShadow: buttonActive ? '0 0 20px rgba(16, 185, 129, 0.6)' : '0 0 20px rgba(37, 99, 235, 0.5)',
            transform: buttonActive ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 0.15s ease',
          }}
        >
          {buttonActive ? '✓ DM Sent' : buttonLabel}
        </button>
      </div>

      {/* Subtext */}
      <div style={{ textAlign: 'center', marginTop: 24, color: '#38BDF8', fontFamily: 'Inter', fontSize: 16, fontWeight: 600 }}>
        Comment 'EXAM' — prompt main aapko DM me send kar dunga 📩
      </div>
    </div>
  );
};
