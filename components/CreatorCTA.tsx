/**
 * CreatorCTA.tsx — Scene 7: Creator CTA & Comment Mock
 *
 * Requirements (FIX 1):
 * - Creator card before comment box:
 *   - Avatar with "ZD" monogram & blue glow ring.
 *   - Name: "ZD" (no placeholder text).
 *   - Handle: "@zd_Insights" (no placeholder text).
 *   - Blue "Follow" button.
 * - Animation:
 *   - Card enters in 400ms (fade + rise 10px, ease-out).
 *   - Cursor taps Follow at 1.5s after entry (press state scale 0.96, 150ms).
 *   - Button changes to "Following" (outlined state: transparent bg, 2px blue border, #60A5FA text).
 * - Timing inside Scene 7 (6.5s total = 195 frames):
 *   - Card: 0 to 2.5s (localFrame 0..75).
 *   - Comment box slides up at 2.5s (localFrame 75).
 *   - Keyword types 2.5 to 4.5s (localFrame 75..135, "HARNESS").
 *   - Send press at 4.7s (localFrame 141, scale 0.96 for 150ms, then "✓ Sent").
 *   - Final hold: 1.5s (localFrame 150..195).
 *   - Fade out to black: 0.5s (localFrame 180..195).
 * - Minimum 26px typography for all labels, handles, and tags.
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface CreatorCTAProps {
  startFrame?: number;
}

export const CreatorCTA: React.FC<CreatorCTAProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Timing breakdown:
  // Phase 1 (0 to 2.5s = frames 0..75): Creator Card
  // Phase 2 (2.5s to 6.5s = frames 75..195): Comment Box
  const isCommentPhase = localFrame >= 75;

  // 1. Creator Card Entrance: 400ms (12 frames) fade + rise 10px, ease-out
  const cardEntrance = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const cardTranslateY = interpolate(cardEntrance, [0, 1], [10, 0]);
  const cardOpacity = cardEntrance;

  // Follow button click at 1.5s after entry = 45 frames (150ms press = frames 45..50)
  const isTappingFollow = localFrame >= 45 && localFrame < 50;
  const isFollowed = localFrame >= 50;

  // Follow Cursor animation: moves from (560, 380) to Follow button (454, 286) over frames 22..45
  const followCursorProgress = interpolate(localFrame, [22, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const followCursorX = interpolate(followCursorProgress, [0, 1], [600, 480]);
  const followCursorY = interpolate(followCursorProgress, [0, 1], [380, 275]);
  const followCursorOpacity = interpolate(localFrame, [18, 22, 54, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Comment Box Entrance: slides up at 2.5s (frames 75..87 = 400ms slide-up)
  const commentProgress = interpolate(localFrame, [75, 87], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const commentTranslateY = interpolate(commentProgress, [0, 1], [24, 0]);
  const commentOpacity = commentProgress;

  // Keyword letter-by-letter typing: 2.5s to 4.5s (frames 75..135 = 60 frames)
  const FULL_KEYWORD = 'HARNESS';
  const typeDurationFrames = 60; // 2 seconds
  const typeLocal = Math.max(0, localFrame - 75);
  const lettersTyped = Math.min(
    FULL_KEYWORD.length,
    Math.floor((typeLocal / typeDurationFrames) * (FULL_KEYWORD.length + 1))
  );
  const currentTypedText = FULL_KEYWORD.slice(0, lettersTyped);

  // Send press at 4.7s = 141 frames (150ms press = frames 141..146)
  const isTappingSend = localFrame >= 141 && localFrame < 146;
  const isSent = localFrame >= 146;

  // Send Cursor animation: moves towards Send button over frames 124..141
  const sendCursorProgress = interpolate(localFrame, [124, 141], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const sendCursorX = interpolate(sendCursorProgress, [0, 1], [640, 770]);
  const sendCursorY = interpolate(sendCursorProgress, [0, 1], [220, 126]);
  const sendCursorOpacity = interpolate(localFrame, [120, 125, 150, 156], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Final 0.5s (15 frames) fade out to black at the end (frames 180..195)
  const fadeToBlack = interpolate(localFrame, [180, 195], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 500,
        left: 86, // 8% safe zone
        width: 908,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {!isCommentPhase ? (
        /* PART 1: Creator Card (0 to 2.5s) */
        <div
          style={{
            width: '100%',
            backgroundColor: '#101422',
            borderRadius: 24,
            border: '2px solid rgba(59, 130, 246, 0.45)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.25)',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${cardTranslateY}px)`,
            opacity: cardOpacity,
            position: 'relative',
          }}
        >
          {/* Avatar with "ZD" monogram & blue glow ring */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              border: '3px solid #3B82F6',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 44,
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              ZD
            </span>
          </div>

          {/* Name: "ZD" (min 26px) */}
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 38,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            ZD
          </div>

          {/* Handle: "@zd_Insights" (min 26px) */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 26, // min 26px requirement
              fontWeight: 700,
              color: '#60A5FA',
              marginBottom: 32,
            }}
          >
            @zd_Insights
          </div>

          {/* Blue Follow Button / Outlined Following State */}
          <button
            style={{
              padding: '16px 56px',
              borderRadius: 14,
              backgroundColor: isFollowed ? 'transparent' : '#3B82F6',
              border: '2px solid #3B82F6',
              color: isFollowed ? '#60A5FA' : '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px requirement
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: isFollowed ? 'none' : '0 0 25px rgba(59, 130, 246, 0.6)',
              transform: isTappingFollow ? 'scale(0.96)' : 'scale(1)',
              transition: 'transform 0.15s ease, background-color 0.2s ease',
            }}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>

          {/* Cursor tapping Follow */}
          {followCursorOpacity > 0 && (
            <div
              style={{
                position: 'absolute',
                left: followCursorX,
                top: followCursorY,
                transform: isTappingFollow ? 'scale(0.85)' : 'scale(1)',
                opacity: followCursorOpacity,
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
                  fill="#FFFFFF"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ) : (
        /* PART 2: Comment Box (2.5s to 6.5s) */
        <div
          style={{
            width: '100%',
            backgroundColor: '#101422',
            borderRadius: 24,
            border: '2px solid #3B82F6',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(59, 130, 246, 0.35)',
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${commentTranslateY}px)`,
            opacity: commentOpacity,
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 28, // min 26px
              fontWeight: 800,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 1.3,
            }}
          >
            Comment <span style={{ color: '#60A5FA', textDecoration: 'underline' }}>HARNESS</span> aur main link bhejunga
          </div>

          {/* Comment Input Box with typing animation */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#070A14',
              borderRadius: 18,
              border: '2px solid rgba(59, 130, 246, 0.55)',
              padding: '14px 18px 14px 26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28, // min 26px
                fontWeight: 700,
                color: '#60A5FA',
                letterSpacing: '0.04em',
                minWidth: 160,
              }}
            >
              {currentTypedText}
              {localFrame >= 75 && lettersTyped < FULL_KEYWORD.length && (
                <span style={{ color: '#3B82F6' }}>|</span>
              )}
            </div>

            {/* Blue Send Button */}
            <button
              style={{
                padding: '14px 36px',
                borderRadius: 12,
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: 26, // min 26px requirement
                fontWeight: 800,
                border: 'none',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
                transform: isTappingSend ? 'scale(0.96)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              {isSent ? '✓ Sent' : 'Send'}
            </button>
          </div>

          {/* Cursor tapping Send button */}
          {sendCursorOpacity > 0 && (
            <div
              style={{
                position: 'absolute',
                left: sendCursorX,
                top: sendCursorY,
                transform: isTappingSend ? 'scale(0.85)' : 'scale(1)',
                opacity: sendCursorOpacity,
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
                  fill="#FFFFFF"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Micro Subtext (min 26px requirement) */}
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 26, // min 26px requirement
              fontWeight: 600,
              color: '#94A3B8',
              marginTop: 24,
              textAlign: 'center',
            }}
          >
            Instant direct link to GitHub repo · Free & Open Source
          </div>
        </div>
      )}

      {/* Final 0.5s fade out to black (last 15 frames: 180..195) */}
      {fadeToBlack > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#000000',
            opacity: fadeToBlack,
            pointerEvents: 'none',
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
};
