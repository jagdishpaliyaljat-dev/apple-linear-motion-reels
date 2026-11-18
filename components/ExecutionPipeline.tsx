import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface ExecutionPipelineProps {
  startFrame?: number;
}

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);

  // Micro floating motion
  const floatY = Math.sin(localFrame / 22) * 6;

  const steps = [
    {
      num: '01',
      title: 'Plan Task',
      detail: 'Deconstruct prompt into atomic goals',
      delay: 6,
      accent: '#38BDF8',
    },
    {
      num: '02',
      title: 'Run Tools',
      detail: 'Autonomous execution across APIs & files',
      delay: 36,
      accent: '#60A5FA',
    },
    {
      num: '03',
      title: 'Verify Output',
      detail: 'Automated SAST audit & quality gates',
      delay: 66,
      accent: '#34D399',
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 510 + floatY,
        left: 60,
        width: 960,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        zIndex: 25,
      }}
    >
      {steps.map((st, i) => {
        const stepSpring = spring({
          frame: localFrame - st.delay,
          fps,
          config: { damping: 14, stiffness: 140 },
        });

        const isCompleted = localFrame >= st.delay + 22;
        const checkmarkSpring = spring({
          frame: localFrame - st.delay - 22,
          fps,
          config: { damping: 12, stiffness: 160 },
        });

        return (
          <div
            key={i}
            style={{
              padding: '34px 42px',
              backgroundColor: 'rgba(20, 20, 24, 0.88)',
              backdropFilter: 'blur(24px)',
              borderRadius: 16,
              border: isCompleted
                ? '1.5px solid #10B981'
                : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: isCompleted
                ? '0 0 40px rgba(16, 185, 129, 0.28), 0 20px 48px rgba(0,0,0,0.7)'
                : '0 20px 48px rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transform: `scale(${stepSpring})`,
              opacity: stepSpring,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.16)' : 'rgba(56, 189, 248, 0.12)',
                  border: isCompleted ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? '#34D399' : '#38BDF8',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: 24,
                }}
              >
                {st.num}
              </div>

              <div>
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: 30,
                    fontWeight: 700,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {st.title}
                </div>
                <div
                  style={{
                    color: '#A1A1AA',
                    fontSize: 19,
                    fontFamily: 'Inter, sans-serif',
                    marginTop: 5,
                  }}
                >
                  {st.detail}
                </div>
              </div>
            </div>

            {/* Checkmark or Status Pill */}
            {isCompleted ? (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 18px #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090B',
                  fontWeight: 900,
                  fontSize: 24,
                  transform: `scale(${checkmarkSpring})`,
                }}
              >
                ✓
              </div>
            ) : (
              <div
                style={{
                  padding: '7px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#71717A',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                PROCESSING
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
