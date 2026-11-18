import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CaptionWord {
  text: string;
  isEmphasized?: boolean;
  hasSelectionBox?: boolean;
  delayFrame?: number;
}

export interface KineticCaptionProps {
  words: CaptionWord[];
  startFrame: number;
  topOffset?: number;
}

export const KineticCaption: React.FC<KineticCaptionProps> = ({
  words,
  startFrame,
  topOffset = 270,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  if (frame < startFrame) {
    return null;
  }

  // Micro floating motion
  const floatY = Math.sin(localFrame / 20) * 4;

  return (
    <div
      style={{
        position: 'absolute',
        top: topOffset + floatY,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: '16px',
        columnGap: '18px',
        padding: '0 54px',
        zIndex: 50,
      }}
    >
      {words.map((item, index) => {
        const wordDelay = item.delayFrame ?? index * 6;
        const wordSpring = spring({
          frame: localFrame - wordDelay,
          fps,
          config: { damping: 14, stiffness: 140 },
        });

        if (localFrame < wordDelay) {
          return null;
        }

        if (item.hasSelectionBox) {
          const boxSpring = spring({
            frame: localFrame - wordDelay - 2,
            fps,
            config: { damping: 14, stiffness: 140 },
          });

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                margin: '0 20px', // Crucial: guarantee box and anchor dots NEVER collide with adjacent words
                padding: '8px 24px',
                border: '2px solid #2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.16)',
                borderRadius: '8px',
                boxShadow: '0 0 32px rgba(37, 99, 235, 0.5)',
                transform: `scale(${boxSpring})`,
              }}
            >
              {/* 4 Corner Anchor Handles (8x8 squares with highlight border) */}
              <div
                style={{
                  position: 'absolute',
                  top: -5,
                  left: -5,
                  width: 10,
                  height: 10,
                  backgroundColor: '#2563EB',
                  border: '1.5px solid #93C5FD',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  width: 10,
                  height: 10,
                  backgroundColor: '#2563EB',
                  border: '1.5px solid #93C5FD',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -5,
                  left: -5,
                  width: 10,
                  height: 10,
                  backgroundColor: '#2563EB',
                  border: '1.5px solid #93C5FD',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  width: 10,
                  height: 10,
                  backgroundColor: '#2563EB',
                  border: '1.5px solid #93C5FD',
                }}
              />

              <span
                style={{
                  fontFamily: 'Instrument Serif, Playfair Display, NotoSerif, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 54,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 16px rgba(255, 255, 255, 0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </span>
            </div>
          );
        }

        if (item.isEmphasized) {
          return (
            <span
              key={index}
              style={{
                fontFamily: 'Instrument Serif, Playfair Display, NotoSerif, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 54,
                fontWeight: 700,
                color: '#60A5FA',
                letterSpacing: '-0.02em',
                transform: `scale(${wordSpring}) translateY(${(1 - wordSpring) * 12}px)`,
                opacity: wordSpring,
                display: 'inline-block',
                whiteSpace: 'pre',
                margin: '0 4px',
              }}
            >
              {item.text}
            </span>
          );
        }

        return (
          <span
            key={index}
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: 52,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              transform: `scale(${wordSpring}) translateY(${(1 - wordSpring) * 12}px)`,
              opacity: wordSpring,
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
};
