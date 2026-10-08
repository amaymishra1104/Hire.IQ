"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Zap,
  Mic, MicOff, Rocket, Target, Brain,
  Key, X, Volume2, VolumeX, Code2, CheckCircle
} from "lucide-react";
import { getApiBase } from "@/lib/api";
import { loadGeminiKey, saveGeminiKey } from "@/lib/brand";
import { toast } from "@/lib/toast";
import { speak as ttsSpeak, cancelSpeech, loadElevenLabsKey, saveElevenLabsKey } from "@/lib/tts";
import { DeepgramSTT, loadDeepgramKey, saveDeepgramKey } from "@/lib/deepgramSTT";
import CompanyPicker from "@/components/CompanyPicker";
import InterviewerAvatar from "@/components/InterviewerAvatar";
import ResumeUpload from "@/components/ResumeUpload";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import ShapeGrid from "@/components/ShapeGrid";
import { useAuth, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({ text, delay = 14 }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      setOut((p) => p + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(id);
    }, delay);
    return () => clearInterval(id);
  }, [text]);
  return <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, color: "#faf9f5", margin: 0 }}>{out}</p>;
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, isLast, streaming }) {
  const [showIdeal, setShowIdeal] = useState(false);
  const ev = msg.evaluation;
  const isAi = msg.role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        justifyContent: isAi ? "flex-start" : "flex-end",
        paddingLeft: msg.isFollowUp ? 24 : 0,
        marginBottom: 16,
      }}
    >
      <div style={{
        maxWidth: "84%",
        borderRadius: isAi ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        padding: "14px 18px",
        backgroundColor: isAi ? "#181715" : "#efe9de",
        color: isAi ? "#faf9f5" : "#141413",
        border: isAi ? "1px solid #252320" : "1px solid #e6dfd8",
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        {/* Streaming typewriter only on the very last AI message while streaming */}
        {isAi && isLast && streaming
          ? <TypewriterText text={msg.text} />
          : <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
        }

        {/* Evaluation box */}
        {ev && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: isAi ? "1px solid #252320" : "1px solid #e6dfd8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: isAi ? "#a09d96" : "#6c6a64", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                Neural Score
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: ev.score >= 7 ? "#5db872" : ev.score >= 5 ? "#e8a55a" : "#c64545" }}>
                {ev.score}<span style={{ fontSize: 12, opacity: 0.5 }}>/10</span>
              </span>
            </div>
            <div style={{ width: "100%", height: 4, backgroundColor: isAi ? "#252320" : "#e6dfd8", borderRadius: 99, marginBottom: 10 }}>
              <div style={{ width: `${ev.score * 10}%`, height: "100%", backgroundColor: ev.score >= 7 ? "#5db872" : ev.score >= 5 ? "#e8a55a" : "#c64545", borderRadius: 99 }} />
            </div>
            {ev.time_complexity && (
              <div style={{ display: "flex", gap: 12, marginBottom: 8, fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: isAi ? "#a09d96" : "#6c6a64" }}>
                <span>Time: {ev.time_complexity}</span>
                <span>Space: {ev.space_complexity}</span>
              </div>
            )}
            {ev.suggestions && (
              <p style={{ margin: "0 0 10px", fontSize: 12, color: isAi ? "#a09d96" : "#6c6a64", fontStyle: "italic" }}>
                💡 {ev.suggestions}
              </p>
            )}
            {ev.ideal_answer && (
              <>
                <button onClick={() => setShowIdeal(p => !p)} style={{ fontSize: 11, color: isAi ? "#faf9f5" : "#141413", backgroundColor: isAi ? "#252320" : "#faf9f5", border: isAi ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e6dfd8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}>
                  {showIdeal ? "Hide Ideal Answer" : "Show Ideal Answer"}
                </button>
                {showIdeal && (
                  <div style={{ marginTop: 10, padding: "12px 14px", backgroundColor: isAi ? "#1f1e1b" : "#faf9f5", border: isAi ? "1px solid #252320" : "1px solid #e6dfd8", borderRadius: 8, fontSize: 13, color: isAi ? "#faf9f5" : "#3d3d3a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {ev.ideal_answer}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Landing Hero ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, title: "Adaptive Difficulty Engine", desc: "Questions calibrate in real-time based on your answers." },
  { icon: Target, title: "60+ Company Styles", desc: "Practice styled for Google, Netflix, Amazon, or any custom target." },
  { icon: Mic, title: "Voice & Live STT", desc: "Speak with real-time Deepgram transcription or type your answers." },
  { icon: Zap, title: "Instant Neural Feedback", desc: "Scored debriefs with complexity analysis and ideal answer breakdowns." },
];

function LandingHero({ onStart }) {
  return (
    <motion.div
      key="landing-hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      style={{ width: "100%", maxWidth: 1100, margin: "0 auto", textAlign: "center", paddingTop: 32 }}
    >
      <div className="badge-coral" style={{ marginBottom: 20 }}>Voice-Activated · Adaptive AI · 60+ Company Styles</div>
      <h1 className="font-serif-display" style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.08, margin: "0 0 20px", color: "#141413" }}>
        Technical interview practice that<br />
        <span style={{ color: "#cc785c" }}>actually adapts to your level.</span>
      </h1>
      <p style={{ fontSize: 18, color: "#3d3d3a", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 40px" }}>
        A live AI interview co-pilot that tunes question difficulty in real-time, mimics authentic company personas, and provides instant scored debriefs.
      </p>
      <button onClick={onStart} className="btn-primary" style={{ padding: "14px 36px", fontSize: 15, borderRadius: 10, marginBottom: 72 }}>
        <Rocket size={18} /> Start Interview Simulation
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, textAlign: "left", marginBottom: 80 }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card-cream" style={{ padding: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon size={20} color="#cc785c" />
            </div>
            <h3 className="font-serif-display" style={{ fontSize: 20, margin: "0 0 8px", color: "#141413" }}>{title}</h3>
            <p style={{ fontSize: 14, color: "#3d3d3a", lineHeight: 1.55, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div className="card-coral" style={{ padding: "64px 32px", textAlign: "center", marginBottom: 80 }}>
        <h2 className="font-serif-display" style={{ fontSize: 36, color: "#ffffff", margin: "0 0 16px" }}>
          Ready to experience your realistic mock round?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", maxWidth: 540, margin: "0 auto 28px" }}>
          Instant scoring on problem solving, communication clarity, and code optimization.
        </p>
        <button onClick={onStart} className="btn-secondary" style={{ backgroundColor: "#faf9f5", color: "#141413", border: "none", padding: "12px 28px", fontSize: 15 }}>
          Begin Simulation →
        </button>
      </div>
    </motion.div>
  );
}

// ─── SSE Stream Reader ────────────────────────────────────────────────────────
async function readSSEStream(url, body, onChunk, onSession, onDone, onError) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    onError?.("Could not reach the server. Make sure the backend is running on port 5000.");
    return;
  }

  if (!response.ok) {
    let errText = "Request failed";
    try { const j = await response.json(); errText = j.error || errText; } catch {}
    onError?.(errText);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.type === "chunk") onChunk?.(parsed.text);
          else if (parsed.type === "session") onSession?.(parsed.sessionId);
          else if (parsed.type === "done") onDone?.(parsed);
          else if (parsed.type === "error") onError?.(parsed.error);
        } catch {}
      }
    }
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const { user } = useUser();
  const { userId } = useAuth();

  const [view, setView] = useState("hero");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [tempElevenKey, setTempElevenKey] = useState("");

  // Setup
  const [role, setRole] = useState("Senior Frontend Engineer");
  const [company, setCompany] = useState("Agnostic");
  const [persona, setPersona] = useState("Harsh Tech Lead");
  const [interviewType, setInterviewType] = useState("Technical");
  const [candidateName, setCandidateName] = useState("");
  const [candidateResume, setCandidateResume] = useState("");

  // Interview state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("// Write your solution here...\nfunction solution() {\n\n}");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttInstance, setSttInstance] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showCodeWorkspace, setShowCodeWorkspace] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [scorecardData, setScorecardData] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  // ── CRITICAL: scroll the CHAT CONTAINER, not the page ───────────────────
  const chatContainerRef = useRef(null);
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => { if (user?.fullName) setCandidateName(user.fullName); }, [user]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [view]);
  useEffect(() => { scrollToBottom(); }, [messages, loading]);
  useEffect(() => { if (interviewType === "Coding Round") setShowCodeWorkspace(true); }, [interviewType]);

  // ── Speak helper using correct tts.js signature ───────────────────────────
  const speakText = (text) => {
    if (!ttsEnabled || !text) return;
    ttsSpeak(text, persona, loadElevenLabsKey() || "", {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleSaveKeys = () => {
    if (tempApiKey.trim()) saveGeminiKey(tempApiKey);
    if (tempElevenKey.trim()) saveElevenLabsKey(tempElevenKey);
    setKeyModalOpen(false);
    setTempApiKey(""); setTempElevenKey("");
    toast.success("API keys saved.");
  };

  // ── START SESSION via /interview/stream-start ─────────────────────────────
  const handleStartSession = async () => {
    const userApiKey = loadGeminiKey();
    if (!userApiKey) { setKeyModalOpen(true); toast.error("Please add your Gemini API key first."); return; }

    setView("interview");
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    setStreaming(true);
    setMessages([]);
    setIsComplete(false);

    const isCodingRound = interviewType === "Coding Round";
    let accum = "";

    await readSSEStream(
      `${getApiBase()}/interview/stream-start`,
      {
        userApiKey,
        clerkId: userId || undefined,
        role,
        candidateName: candidateName || "Candidate",
        resumeContext: candidateResume || undefined,
        isCodingRound,
      },
      (chunk) => {
        accum += chunk;
        setMessages([{ role: "ai", text: accum }]);
      },
      (sId) => setSessionId(sId),
      () => {
        setLoading(false);
        setStreaming(false);
        speakText(accum);
      },
      (err) => {
        setLoading(false);
        setStreaming(false);
        toast.error(err);
      }
    );
  };

  // ── SUBMIT ANSWER via /interview/answer (reliable single-call endpoint) ───
  const handleSubmitAnswer = async () => {
    const combinedAnswer = showCodeWorkspace
      ? `${userAnswer}\n\n[Code Submission]:\n${codeAnswer}`
      : userAnswer;
    if (!combinedAnswer.trim() || loading || !sessionId) return;

    const userApiKey = loadGeminiKey();
    const isCodingRound = interviewType === "Coding Round";

    // 1. Immediately show user's message
    setMessages(prev => [...prev, { role: "user", text: combinedAnswer }]);
    setUserAnswer("");
    setLoading(true);

    try {
      // 2. Call /interview/answer — evaluates + generates next Q in one shot
      const res = await axios.post(`${getApiBase()}/interview/answer`, {
        sessionId,
        answer: combinedAnswer,
        userApiKey,
        clerkId: userId || undefined,
        resumeContext: candidateResume || undefined,
        isCodingRound,
        candidateName: candidateName || "Candidate",
      });

      const { evaluation, isComplete: done, nextQuestion, sessionSummary } = res.data;

      // 3. Update difficulty badge
      if (sessionSummary?.currentDifficulty) setDifficulty(sessionSummary.currentDifficulty);

      if (done) {
        setIsComplete(true);
        setMessages(prev => [...prev, {
          role: "ai",
          text: "🎉 Excellent work! You've completed all interview questions. Click 'Finish & Get Scorecard' for your full performance debrief.",
          evaluation,
        }]);
      } else {
        // 4. Stream next question using /interview/stream-next for visual effect
        let nextAccum = "";
        setStreaming(true);

        await readSSEStream(
          `${getApiBase()}/interview/stream-next`,
          {
            sessionId,
            answer: combinedAnswer,
            userApiKey,
            isCodingRound,
            candidateName: candidateName || "Candidate",
            resumeContext: candidateResume || undefined,
            evaluationScore: evaluation?.score ?? 5,
            nextDifficulty: sessionSummary?.currentDifficulty || difficulty,
          },
          (chunk) => {
            nextAccum += chunk;
            // Add or replace the pending AI message (with evaluation attached)
            setMessages(prev => {
              const last = prev[prev.length - 1];
              // If we already have a pending AI message from this round, update it
              if (last?.role === "ai" && last._isStreaming) {
                return [...prev.slice(0, -1), { role: "ai", text: nextAccum, evaluation, _isStreaming: true }];
              }
              return [...prev, { role: "ai", text: nextAccum, evaluation, _isStreaming: true }];
            });
          },
          null,
          () => {
            // Finalize message — remove _isStreaming flag
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "ai" && last._isStreaming) {
                const { _isStreaming, ...clean } = last;
                return [...prev.slice(0, -1), clean];
              }
              return prev;
            });
            setStreaming(false);
            setLoading(false);
            speakText(nextAccum);
          },
          (err) => {
            setStreaming(false);
            setLoading(false);
            toast.error(err);
          }
        );
        return; // loading is set to false inside the SSE callback above
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to process answer. Check backend is running.");
    } finally {
      // Only set loading false here if not streaming (streaming sets its own)
      if (!streaming) setLoading(false);
    }
  };

  // ── STT Toggle ────────────────────────────────────────────────────────────
  const toggleSTT = () => {
    const dgKey = loadDeepgramKey();
    if (!dgKey) {
      const inputKey = prompt("Enter your Deepgram API Key for live voice STT:");
      if (inputKey) saveDeepgramKey(inputKey);
      else return;
    }
    if (isListening) {
      sttInstance?.stop();
      setIsListening(false);
    } else {
      const stt = new DeepgramSTT(
        (text) => setUserAnswer(p => (p ? p + " " + text : text)),
        (err) => toast.error(`STT error: ${err}`),
        () => setIsListening(true),
        () => setIsListening(false)
      );
      stt.start();
      setSttInstance(stt);
    }
  };

  // ── Finish & Scorecard ────────────────────────────────────────────────────
  const handleFinishSession = async () => {
    if (!sessionId) { setView("hero"); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${getApiBase()}/interview/session/${sessionId}`);
      setScorecardData(res.data);
      setView("scorecard");
    } catch {
      toast.error("Could not fetch scorecard.");
      setView("hero");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#faf9f5", color: "#141413" }}>
      <ShapeGrid />
      <TopNav onOpenKeyModal={() => setKeyModalOpen(true)} />

      {/* ── API Key Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {keyModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(20,20,19,0.65)", backdropFilter: "blur(4px)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
              style={{ backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: 12, padding: 36, maxWidth: 460, width: "100%", boxShadow: "0 20px 48px rgba(20,20,19,0.15)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 className="font-serif-display" style={{ fontSize: 24, margin: 0 }}>Configure AI Engine Keys</h3>
                <button onClick={() => setKeyModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c6a64" }}><X size={18} /></button>
              </div>

              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 6 }}>
                Google Gemini API Key <span style={{ color: "#cc785c" }}>(Required · Free)</span>
              </label>
              <input className="input-editorial" type="password" placeholder="AIzaSy..." value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} style={{ marginBottom: 8 }} />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#cc785c", marginBottom: 20 }}>Get your free Gemini key →</a>

              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 6 }}>
                ElevenLabs Voice Key <span style={{ color: "#8e8b82" }}>(Optional · Realistic TTS)</span>
              </label>
              <input className="input-editorial" type="password" placeholder="sk_..." value={tempElevenKey} onChange={e => setTempElevenKey(e.target.value)} style={{ marginBottom: 24 }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="btn-secondary" onClick={() => setKeyModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveKeys}>Save Credentials</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, position: "relative", zIndex: 10, padding: "32px 24px" }}>

        {/* HERO */}
        {view === "hero" && <LandingHero onStart={() => setView("setup")} />}

        {/* SETUP */}
        {view === "setup" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 880, margin: "0 auto" }}>
            <button className="btn-secondary" onClick={() => setView("hero")} style={{ padding: "6px 14px", fontSize: 13, marginBottom: 16 }}>← Back</button>
            <h1 className="font-serif-display" style={{ fontSize: 38, margin: "0 0 8px" }}>Configure Your Practice Round</h1>
            <p style={{ fontSize: 15, color: "#6c6a64", marginBottom: 28 }}>Select your target role, company, interviewer persona, and round type.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div className="card-cream" style={{ padding: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 8 }}>Target Engineering Role</label>
                <input className="input-editorial" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Fullstack Engineer" style={{ marginBottom: 12 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {["Senior Frontend", "Backend Architect", "AI Specialist", "Engineering Lead"].map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 99, border: "1px solid #e6dfd8", background: role === r ? "#efe9de" : "#faf9f5", color: "#141413", cursor: "pointer" }}>{r}</button>
                  ))}
                </div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 8 }}>Candidate Name</label>
                <input className="input-editorial" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Your Name" />
              </div>
              <div className="card-cream" style={{ padding: 24 }}>
                <CompanyPicker value={company} onChange={setCompany} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div className="card-cream" style={{ padding: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 12 }}>Round Category</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["Technical", "HR & Culture", "System Design", "Coding Round"].map(t => (
                    <button key={t} type="button" onClick={() => setInterviewType(t)} style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", backgroundColor: interviewType === t ? "#efe9de" : "#faf9f5", border: interviewType === t ? "1.5px solid #cc785c" : "1px solid #e6dfd8", color: interviewType === t ? "#141413" : "#6c6a64", textAlign: "center" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="card-cream" style={{ padding: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 12 }}>Interviewer Persona</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { name: "Harsh Tech Lead", desc: "Direct, deep probing, zero tolerance for fluff" },
                    { name: "Friendly Microsoft HR", desc: "Warm, behavioral STAR methodology" },
                    { name: "Chaotic Startup Founder", desc: "Fast-paced, practical product trade-offs" },
                  ].map(p => (
                    <button key={p.name} type="button" onClick={() => setPersona(p.name)} style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", textAlign: "left", backgroundColor: persona === p.name ? "#efe9de" : "#faf9f5", border: persona === p.name ? "1.5px solid #cc785c" : "1px solid #e6dfd8" }}>
                      <div style={{ fontWeight: 600, color: "#141413" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#6c6a64" }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-cream" style={{ padding: 24, marginBottom: 32 }}>
              <ResumeUpload value={candidateResume} onChange={setCandidateResume} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
              <button className="btn-secondary" onClick={() => setView("hero")}>Cancel</button>
              <button className="btn-primary" onClick={handleStartSession} style={{ padding: "12px 32px", fontSize: 15 }}>
                <Rocket size={16} /> Begin Interview Session
              </button>
            </div>
          </motion.div>
        )}

        {/* INTERVIEW ROOM */}
        {view === "interview" && (
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status bar */}
            <div className="card-cream" style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <InterviewerAvatar persona={persona} isSpeaking={isSpeaking} isListening={isListening} size={42} />
                <div>
                  <h3 className="font-serif-display" style={{ fontSize: 18, margin: 0, color: "#141413" }}>{role} · {company}</h3>
                  <span style={{ fontSize: 12, color: "#6c6a64" }}>{persona} ({interviewType})</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={() => { if (ttsEnabled) cancelSpeech(); setTtsEnabled(p => !p); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e6dfd8", background: "#faf9f5", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#141413" }}>
                  {ttsEnabled ? <Volume2 size={14} color="#5db872" /> : <VolumeX size={14} color="#8e8b82" />}
                  <span>{ttsEnabled ? "Voice On" : "Muted"}</span>
                </button>
                <button type="button" onClick={() => setShowCodeWorkspace(p => !p)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e6dfd8", background: showCodeWorkspace ? "#efe9de" : "#faf9f5", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#141413" }}>
                  <Code2 size={14} color="#cc785c" />
                  <span>{showCodeWorkspace ? "Hide Editor" : "Open Code Editor"}</span>
                </button>
                <span className="badge-pill" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12 }}>
                  Difficulty: <strong style={{ color: "#cc785c", marginLeft: 4 }}>{difficulty}</strong>
                </span>
                <button className="btn-secondary" onClick={handleFinishSession} disabled={loading} style={{ padding: "6px 14px", fontSize: 12 }}>
                  {loading && !streaming ? <Loader2 size={14} className="animate-spin" /> : "Finish & Scorecard"}
                </button>
              </div>
            </div>

            {/* Workspace */}
            <div style={{ display: "grid", gridTemplateColumns: showCodeWorkspace ? "1fr 1fr" : "1fr", gap: 20 }}>
              {/* Chat panel — FIXED SCROLL: uses ref on container, not scrollIntoView */}
              <div className="card-cream" style={{ display: "flex", flexDirection: "column", height: 620 }}>
                {/* Scrollable message area */}
                <div
                  ref={chatContainerRef}
                  style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0 20px" }}
                >
                  {messages.map((m, idx) => (
                    <ChatMessage
                      key={idx}
                      msg={m}
                      isLast={idx === messages.length - 1}
                      streaming={streaming && idx === messages.length - 1 && m.role === "ai"}
                    />
                  ))}
                  {loading && messages.length === 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6c6a64", padding: 12 }}>
                      <Loader2 size={18} color="#cc785c" className="animate-spin" />
                      <span>Starting your interview session...</span>
                    </div>
                  )}
                  {loading && !streaming && messages.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, marginBottom: 16 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#cc785c", animation: "pulse 1s infinite" }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#cc785c", animation: "pulse 1s 0.2s infinite" }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#cc785c", animation: "pulse 1s 0.4s infinite" }} />
                    </div>
                  )}
                </div>

                {/* Answer input */}
                <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #e6dfd8" }}>
                  {isComplete ? (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <CheckCircle size={24} color="#5db872" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: "#6c6a64", margin: 0 }}>Interview complete — review your results above.</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        className="input-editorial"
                        rows={3}
                        placeholder={isListening ? "🎙 Listening to your voice..." : "Type your answer (Enter to submit, Shift+Enter for newline)..."}
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); } }}
                        disabled={loading}
                        style={{ marginBottom: 10, resize: "none" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button type="button" onClick={toggleSTT} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid #e6dfd8", backgroundColor: isListening ? "#c64545" : "#faf9f5", color: isListening ? "#ffffff" : "#141413", display: "flex", alignItems: "center", gap: 6 }}>
                          {isListening ? <MicOff size={15} /> : <Mic size={15} color="#cc785c" />}
                          <span>{isListening ? "Stop Voice" : "Live STT"}</span>
                        </button>
                        <button className="btn-primary" onClick={handleSubmitAnswer} disabled={loading || !userAnswer.trim()} style={{ padding: "8px 24px" }}>
                          {loading ? <Loader2 size={15} className="animate-spin" /> : "Submit Answer →"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              {showCodeWorkspace && (
                <div style={{ height: 620 }}>
                  <CodeEditor
                    value={codeAnswer}
                    onChange={setCodeAnswer}
                    language={codeLanguage}
                    onLanguageChange={setCodeLanguage}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCORECARD */}
        {view === "scorecard" && scorecardData && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="card-cream" style={{ padding: 40, marginBottom: 32 }}>
              <div className="badge-coral" style={{ marginBottom: 16 }}>Session Performance Scorecard</div>
              <h1 className="font-serif-display" style={{ fontSize: 36, margin: "0 0 8px" }}>{scorecardData.role} Interview Debrief</h1>
              <p style={{ fontSize: 14, color: "#6c6a64", margin: "0 0 32px" }}>Company: {scorecardData.company} · Persona: {scorecardData.persona}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                <div style={{ backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", padding: 20, borderRadius: 10 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5db872", marginBottom: 10 }}>Strengths</h4>
                  {(scorecardData.globalStrengths || []).map((s, i) => <div key={i} style={{ fontSize: 13, color: "#3d3d3a", marginBottom: 4 }}>+ {s}</div>)}
                </div>
                <div style={{ backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", padding: 20, borderRadius: 10 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#cc785c", marginBottom: 10 }}>Improvement Areas</h4>
                  {(scorecardData.globalWeaknesses || []).map((w, i) => <div key={i} style={{ fontSize: 13, color: "#3d3d3a", marginBottom: 4 }}>— {w}</div>)}
                </div>
              </div>

              <h3 className="font-serif-display" style={{ fontSize: 22, marginBottom: 16 }}>Question & Answer Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                {(scorecardData.history || []).map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6c6a64" }}>Question {idx + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace", color: "#cc785c" }}>Score: {item.evaluation?.score ?? "—"}/10</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>{item.question}</p>
                    <p style={{ fontSize: 13, color: "#6c6a64", margin: "0 0 12px", whiteSpace: "pre-wrap" }}>Your Answer: {item.answer}</p>
                    {item.evaluation?.ideal_answer && (
                      <div style={{ backgroundColor: "#efe9de", padding: 12, borderRadius: 8, fontSize: 12, color: "#141413" }}>
                        <strong>Ideal Answer:</strong> {item.evaluation.ideal_answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setView("hero")}>Return to Overview</button>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
