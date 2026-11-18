/**
 * Reel.tsx — Studio-Grade Vertical Explainer Reel
 * Topic: "AI को अपना Personal Examiner बनाओ" (Turn AI into your Personal Socratic Examiner)
 * Format: 1080x1920, 30fps, 32.0s (960 frames), H.264, AAC.
 * Voice: Refined ElevenLabs Voice R (Natural Human Pronunciation: exam/examiner/active recall)
 *
 * Implements 12 fast beats locked to refined Voice R timing:
 * 1. Hook: AI se notes summarize karwana band karo (0..70, 70f)
 * 2. Problem: ye passive reading illusion of competence deti hai (70..157, 87f)
 * 3. Science: Science 2006 research ke mutabik (157..213, 56f)
 * 4. The Drop: passive reading se ek hafte baad 34% retention bachta hai (213..326, 113f)
 * 5. The Leap: lekin active testing se retention 61% jump karta hai (326..430, 104f)
 * 6. Setup: apne AI ko strict viva examiner banao (430..497, 67f)
 * 7. Rule 1: mujhe explain mat karo direct tough sawal pucho (497..580, 83f)
 * 8. Rule 2: har answer ko 10 me se score karo (580..645, 65f)
 * 9. Rule 3: jaha buzzword dikhe turant counter question pucho (645..728, 83f)
 * 10. Diagnostic: ye tumhare exact blindspots expose kar dega (728..803, 75f)
 * 11. Light Climax: active recall se exam hall panic khatam ho jayega (803..891, 88f, LIGHT THEME #F5F5F0)
 * 12. Payoff & CTA: prompt description me hai abhi try karo (891..960, 69f, DARK THEME #09090B)
 */

import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, staticFile, interpolate } from 'remotion';

import { WordCaption, WordEntry } from './components/WordCaption';
import { CameraRig } from './components/CameraRig';
import { HeroLogoRing } from './components/HeroLogoRing';
import { OrbitalHub } from './components/OrbitalHub';
import { BrowserWindow } from './components/BrowserWindow';
import { TerminalLog } from './components/TerminalLog';
import { CodeEditor } from './components/CodeEditor';
import { StatCard } from './components/StatCard';
import { LineChart } from './components/LineChart';
import { TakeawayCard } from './components/TakeawayCard';
import { Cursor } from './components/Cursor';
import { CommentSheet } from './components/CommentSheet';

import wordsData from '../words.json';

const WORDS = wordsData as WordEntry[];

export const Harness2Reel: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle ambient blue light sweep
  const sweepX = Math.sin((frame / 45) * Math.PI) * 160;
  const sweepY = Math.cos((frame / 60) * Math.PI) * 200;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#09090B',
        overflow: 'hidden',
      }}
    >
      {/* 1. CONSISTENT DARK BACKGROUND: #09090B with subtle glow and grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 540 - 320 + sweepX,
            top: 960 - 320 + sweepY,
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ========================================================
          BEAT 1 (0–70): Hook — Stop Summarizing Notes
         ======================================================== */}
      <Sequence from={0} durationInFrames={70}>
        <CameraRig durationInFrames={70} focusScale={1.06} focusPanY={10}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <HeroLogoRing
              topBadge="COGNITIVE ACTIVE RECALL"
              footerTag="RETHINK HOW YOU STUDY WITH AI"
              startFrame={0}
              cy={960}
            />
            {/* Warning Callout in Center */}
            <div
              style={{
                position: 'absolute',
                left: 540 - 240,
                top: 960 - 55,
                width: 480,
                padding: '16px 24px',
                borderRadius: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid #EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 60,
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
              }}
            >
              <div style={{ color: '#EF4444', fontFamily: 'Inter', fontSize: 16, fontWeight: 900, letterSpacing: '0.08em' }}>
                ✕ PASSIVE SUMMARIES BANNED
              </div>
              <div style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                summarize_notes() == 0% RETENTION
              </div>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 2 (70–157): Problem — Illusion of Competence
         ======================================================== */}
      <Sequence from={70} durationInFrames={87}>
        <CameraRig durationInFrames={87} focusScale={1.08} focusPanY={-10}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 960 }}>
              <BrowserWindow url="chatgpt.com/study-session" width={960}>
                <div style={{ padding: '36px 40px', backgroundColor: '#0B0F19', color: '#F1F5F9', minHeight: 340 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#94A3B8', fontFamily: 'Inter' }}>
                      Prompt: "Summarize Chapter 4 for me..."
                    </div>
                    <span style={{ fontSize: 13, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '6px 14px', borderRadius: 9999, fontWeight: 800 }}>
                      PASSIVE READING TRAP
                    </span>
                  </div>
                  <div style={{ padding: '24px', borderRadius: 16, backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1.5px solid rgba(239, 68, 68, 0.4)', marginTop: 16 }}>
                    <div style={{ color: '#EF4444', fontSize: 24, fontWeight: 900, fontFamily: 'Inter' }}>
                      ILLUSION OF COMPETENCE
                    </div>
                    <div style={{ color: '#CBD5E1', fontSize: 18, marginTop: 8, lineHeight: 1.5, fontFamily: 'Inter' }}>
                      Reading summaries creates familiarity, not neural retrieval strength. In an exam, your brain goes completely blank.
                    </div>
                  </div>
                </div>
              </BrowserWindow>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 3 (157–213): Science Basis — Roediger & Karpicke 2006
         ======================================================== */}
      <Sequence from={157} durationInFrames={56}>
        <CameraRig durationInFrames={56} focusScale={1.12} focusPanY={10}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <StatCard
              label="PEER-REVIEWED COGNITIVE SCIENCE"
              targetValue={2006}
              prefix="Science · "
              suffix=""
              decimals={0}
              sublabel="Roediger & Karpicke Benchmark"
              dimmed={false}
              accentColor="#3B82F6"
              startFrame={0}
              width={900}
            />
            <div
              style={{
                width: 900,
                padding: '24px 32px',
                borderRadius: 18,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1.5px solid rgba(59, 130, 246, 0.4)',
                color: '#93C5FD',
                fontFamily: 'Inter',
                fontSize: 20,
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              "The Testing Effect: Test-Enhanced Learning in Long-Term Memory"
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 4 (213–326): Metric — Passive Re-reading Drops to 34%
         ======================================================== */}
      <Sequence from={213} durationInFrames={113}>
        <CameraRig durationInFrames={113} focusScale={1.08} focusPanY={-12}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
            <StatCard
              label="PASSIVE RE-READING (1 WEEK RETENTION)"
              targetValue={34.0}
              suffix="%"
              decimals={1}
              sublabel="Steep Forgetting Curve After 7 Days"
              dimmed={false}
              accentColor="#EF4444"
              startFrame={0}
              width={920}
            />
            <div style={{ width: 920, height: 260, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: 20, border: '1.5px solid rgba(239, 68, 68, 0.3)', padding: '24px 32px' }}>
              <div style={{ color: '#F87171', fontFamily: 'Inter', fontSize: 18, fontWeight: 800 }}>
                FORGETTING CURVE TRAJECTORY
              </div>
              <div style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 16, marginTop: 8 }}>
                Day 1: 81% familiarity → Day 7: 34% actual recall (Critical Drop)
              </div>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 5 (326–430): The Leap — Active Testing Jumps to 61%
         ======================================================== */}
      <Sequence from={326} durationInFrames={104}>
        <CameraRig durationInFrames={104} focusScale={1.12} focusPanY={12}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
            <StatCard
              label="ACTIVE RETRIEVAL TESTING EFFECT"
              targetValue={61.0}
              suffix="%"
              decimals={1}
              sublabel="+80% Higher 1-Week Retention vs Passive Study"
              dimmed={false}
              accentColor="#10B981"
              startFrame={0}
              width={920}
            />
            <div
              style={{
                width: 920,
                padding: '24px 36px',
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '2px solid #10B981',
                boxShadow: '0 0 45px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 900, color: '#FFFFFF' }}>
                  NEURAL RETRIEVAL ADVANTAGE
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 16, color: '#A7F3D0', marginTop: 4 }}>
                  Science 2006 Empirical Benchmark
                </div>
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 44, fontWeight: 900, color: '#10B981' }}>
                +80%
              </div>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 6 (430–497): Setup — Strict Viva Examiner Prompt
         ======================================================== */}
      <Sequence from={430} durationInFrames={67}>
        <CameraRig durationInFrames={67} focusScale={1.15} focusPanY={0}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 960 }}>
              <BrowserWindow url="prompt.ai / socratic-examiner" width={960}>
                <div style={{ padding: '36px 40px', backgroundColor: '#090D18', color: '#F8FAFC' }}>
                  <div style={{ fontSize: 18, color: '#38BDF8', fontWeight: 800, fontFamily: 'Inter', marginBottom: 12 }}>
                    SYSTEM ROLE DIRECTIVE
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, lineHeight: 1.6, color: '#F1F5F9' }}>
                    "Act as a strict Cambridge/IIT Viva Examiner.<br />
                    Never explain concepts.<br />
                    Interrogate me with 1 tough question at a time."
                  </div>
                  <div style={{ display: 'inline-block', marginTop: 20, padding: '8px 18px', backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1.5px solid #3B82F6', borderRadius: 9999, color: '#60A5FA', fontSize: 14, fontWeight: 800 }}>
                    ● EXAMINER PROTOCOL READY
                  </div>
                </div>
              </BrowserWindow>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 7 (497–580): Rule 1 — Direct Tough Interrogation (Terminal)
         ======================================================== */}
      <Sequence from={497} durationInFrames={83}>
        <CameraRig durationInFrames={83} focusScale={1.10} focusPanY={15}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TerminalLog
              toolName="viva_interrogator"
              metaPills={['Socratic', 'Round-1', 'Active']}
              logs={[
                { text: 'examiner: Initiating conceptual viva session...', status: 'done', rightText: '12ms' },
                { text: 'Q1: Why does Self-Attention scale O(N^2) in memory?', status: 'done', rightText: 'live' },
                { text: 'student: Because of token embeddings multiplication.', status: 'done', rightText: 'submitted' },
                { text: 'examiner: INCOMPLETE. Buzzword detected. Define tensor allocation.', status: 'active' },
                { text: 'eval: Grilling underlying math mechanism...', status: 'pending' },
              ]}
              finalMetric="Viva Diagnostic: Depth 2 / 5"
              startFrame={0}
              revealEvery={8}
              width={960}
            />
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 8 (580–645): Rule 2 — Score Each Answer 0 to 10
         ======================================================== */}
      <Sequence from={580} durationInFrames={65}>
        <CameraRig durationInFrames={65} focusScale={1.12} focusPanX={-15}>
          <div
            style={{
              position: 'absolute',
              top: 540,
              left: 60,
              width: 960,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
          >
            <StatCard label="Conceptual Depth" targetValue={7.5} suffix=" / 10" decimals={1} sublabel="Core Principle Defense" dimmed={false} startFrame={0} width={468} />
            <StatCard label="Buzzword Penalty" targetValue={2.0} prefix="-" suffix=" pts" decimals={1} sublabel="Vague Jargon Deductions" dimmed={false} accentColor="#EF4444" startFrame={10} width={468} />
            <StatCard label="Precision Metric" targetValue={8.0} suffix=" / 10" decimals={1} sublabel="Direct Mechanism Accuracy" dimmed={false} accentColor="#3B82F6" startFrame={20} width={468} />
            <StatCard label="Overall Viva Score" targetValue={6.8} suffix=" / 10" decimals={1} sublabel="Strict Cambridge Rubric" dimmed={false} accentColor="#10B981" startFrame={30} width={468} />
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 9 (645–728): Rule 3 — Flag Buzzwords & Counter-Question
         ======================================================== */}
      <Sequence from={645} durationInFrames={83}>
        <CameraRig durationInFrames={83} focusScale={1.18} focusPanY={25}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CodeEditor
              filename="examiner_evaluator.py"
              lines={[
                "def evaluate_viva_response(answer: str):",
                "    fluff = detect_unsubstantiated_jargon(answer)",
                "    if fluff.present:",
                "        # INTERRUPT: Demand exact mathematical proof",
                "        return fire_counter_question(topic='Attention Tensors')",
                "    return score_depth(rubric='IIT_Cambridge')",
              ]}
              activeLineIndex={3}
              footerMeta="rubric active · penalty -2 pts · counter-question dispatched"
              startFrame={0}
              width={960}
            />
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 10 (728–803): Diagnostic — Expose Exact Blindspots
         ======================================================== */}
      <Sequence from={728} durationInFrames={75}>
        <CameraRig durationInFrames={75} focusScale={1.10} focusPanY={-10}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <OrbitalHub
              centerLabel="BLINDSPOTS"
              centerSublabel="DIAGNOSTIC MAP"
              satellites={['Token Tensors', 'Memory Math', 'Softmax Scaling', 'Gradient Flow', 'KV Cache', 'Hidden Gaps']}
              badgeType="dot"
              startFrame={0}
              cx={540}
              cy={960}
              radiusX={340}
              radiusY={250}
            />
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 11 (803–891): Climax — Zero Exam Panic (Dark Theme)
         ======================================================== */}
      <Sequence from={803} durationInFrames={88}>
        <CameraRig durationInFrames={88} focusScale={1.06} focusPanY={12}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: 920,
                padding: '48px 44px',
                backgroundColor: '#0F121C',
                borderRadius: 28,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  padding: '8px 20px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  color: '#34D399',
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  marginBottom: 16,
                }}
              >
                ✓ ZERO EXAM HALL PANIC
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 52, fontWeight: 900, color: '#FAFAFA', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                Active Recall Eliminates Panic
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 22, color: '#94A3B8', marginTop: 16, lineHeight: 1.5, maxWidth: 760 }}>
                Because your brain already defended every single concept against the toughest interrogation ten times before the exam.
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
                <span style={{ padding: '8px 18px', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#E2E8F0', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 700, fontSize: 16, fontFamily: 'Inter' }}>
                  Science 2006 Tested
                </span>
                <span style={{ padding: '8px 18px', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#E2E8F0', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 700, fontSize: 16, fontFamily: 'Inter' }}>
                  61% Long-Term Retention
                </span>
              </div>
            </div>
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          BEAT 12 (891–980): Payoff & CTA — Comment 'EXAM' for Prompt
         ======================================================== */}
      <Sequence from={891} durationInFrames={89}>
        <CameraRig durationInFrames={89} focusScale={1.06} focusPanY={15}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', bottom: 0, left: 60, width: 960 }}>
              <CommentSheet
                title="Personal Examiner Prompt"
                placeholder="Comment 'EXAM' karo, prompt aapko DM me send kar dunga..."
                buttonLabel="Send in DM"
                buttonActive={frame - 891 >= 24}
                startFrame={0}
                width={960}
              />
            </div>

            <Cursor
              startX={740}
              startY={1650}
              targetX={910}
              targetY={1385}
              startFrame={0}
              moveFrames={20}
              clickFrame={24}
            />
          </div>
        </CameraRig>
      </Sequence>

      {/* ========================================================
          GLOBAL OVERLAY: Kinetic WordCaption (Top 8-10%, Always Dark)
         ======================================================== */}
      <WordCaption
        tokens={WORDS}
        words={WORDS}
        frame={frame}
        fps={30}
        theme="dark"
      />
    </AbsoluteFill>
  );
};
