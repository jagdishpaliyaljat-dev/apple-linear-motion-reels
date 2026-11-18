/**
 * WordCaption.tsx — Studio Kinetic Caption Overlay
 *
 * Section 8.1 & 9.1 Compliant:
 * - 1–3 words on screen at a time, top 8–10% of canvas (~175px).
 * - Inter ExtraBold 54px, #09090B on light theme, #F4F4F5 on dark theme.
 * - Exactly ONE accent word per caption line in Instrument Serif Italic, lowercase, accent blue #3B82F6.
 * - Word blur-in: blur(8px → 0), translateY(12px → 0) over 6 frames.
 * - Exit: blur(0 → 8px), opacity 1 → 0 over 5 frames.
 * - Never shows a full sentence.
 */

import React from 'react';
import { interpolate } from 'remotion';

export interface CaptionToken {
  text: string;
  words: string[];
  accentWord?: string;
  start: number; // seconds
  end: number;   // seconds
  emphasis?: boolean;
  scene?: number;
}

export type WordEntry = CaptionToken;

interface WordCaptionProps {
  tokens?: CaptionToken[];
  words?: CaptionToken[];
  frame: number;
  fps: number;
  theme?: 'dark' | 'light';
}

export const WordCaption: React.FC<WordCaptionProps> = ({
  tokens,
  words,
  frame,
  fps,
  theme = 'dark',
}) => {
  const timeS = frame / fps;
  const list = tokens || words || [];

  const activeTokens = list.filter((t) => timeS >= t.start && timeS < t.end);
  if (activeTokens.length === 0) return null;

  const isLight = theme === 'light';
  const normalTextColor = isLight ? '#09090B' : '#F4F4F5';
  const accentTextColor = '#3B82F6';

  return (
    <div
      style={{
        position: 'absolute',
        top: 175, // Top 8–10% of canvas
        left: 86,  // Safe zone
        width: 908,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        pointerEvents: 'none',
        zIndex: 250,
      }}
    >
      {activeTokens.map((token, tIdx) => {
        const startFrame = Math.round(token.start * fps);
        const endFrame = Math.round(token.end * fps);
        const localFrame = frame - startFrame;

        // Exit transition: 5 frames
        const framesLeft = endFrame - frame;
        const isExiting = framesLeft < 5 && framesLeft >= 0;
        const exitP = isExiting ? (5 - framesLeft) / 5 : 0;
        const exitBlur = interpolate(exitP, [0, 1], [0, 8], { extrapolateRight: 'clamp' });
        const exitY = interpolate(exitP, [0, 1], [0, -10], { extrapolateRight: 'clamp' });
        const exitOpacity = interpolate(exitP, [0, 0.7, 1], [1, 0.4, 0], { extrapolateRight: 'clamp' });

        const targetAccent = token.accentWord || (token.words.length > 0 ? token.words[0] : '');

        return (
          <div
            key={tIdx}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              justifyContent: 'center',
              alignItems: 'baseline',
              gap: 14,
              whiteSpace: 'nowrap',
              transform: `translateY(${exitY}px)`,
              filter: `blur(${exitBlur}px)`,
              opacity: exitOpacity,
              willChange: 'transform, filter, opacity',
            }}
          >
            {token.words.map((w, idx) => {
              const cleanW = w.replace(/[.,!?:;—]/g, '');
              const isAccent = cleanW.toLowerCase() === targetAccent.toLowerCase();

              // Word-by-word reveal: 2 frames stagger, blur 8->0, Y 12->0 over 6 frames
              const wordStaggerFrames = idx * 2;
              const wordLocalFrame = Math.max(0, localFrame - wordStaggerFrames);
              const wordP = interpolate(wordLocalFrame, [0, 6], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const wordBlur = interpolate(wordP, [0, 1], [8, 0]);
              const wordRise = interpolate(wordP, [0, 1], [12, 0]);
              const wordOpacity = wordP;

              if (isAccent) {
                return (
                  <span
                    key={idx}
                    style={{
                      fontFamily: "'Instrument Serif', Georgia, serif",
                      fontSize: 58,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: accentTextColor,
                      lineHeight: 1,
                      letterSpacing: '0.02em',
                      textTransform: 'lowercase',
                      textShadow: isLight ? 'none' : '0 0 25px rgba(59, 130, 246, 0.45)',
                      transform: `translateY(${wordRise}px)`,
                      filter: `blur(${wordBlur}px)`,
                      opacity: wordOpacity,
                      display: 'inline-block',
                    }}
                  >
                    {cleanW.toLowerCase()}
                  </span>
                );
              }

              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 54, // 54px requirement
                    fontWeight: 800,
                    color: normalTextColor,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    transform: `translateY(${wordRise}px)`,
                    filter: `blur(${wordBlur}px)`,
                    opacity: wordOpacity,
                    display: 'inline-block',
                  }}
                >
                  {cleanW}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
