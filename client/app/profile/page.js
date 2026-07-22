"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import {
  Rocket, Target, ArrowLeft, BarChart3, BrainCircuit, Activity,
  ChevronDown, ChevronUp, MessageSquare, TrendingUp, Trash2, CheckCircle, AlertCircle
} from "lucide-react";
import { getApiBase } from "@/lib/api";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import ShapeGrid from "@/components/ShapeGrid";

function ScoreChip({ score }) {
  const color = score >= 7 ? "#5db872" : score >= 5 ? "#e8a55a" : "#c64545";
  return (
    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, fontSize: 13, color, minWidth: 36, display: "inline-block" }}>
      {score}/10
    </span>
  );
}

function ChatTranscript({ session }) {
  return (
    <div style={{ marginTop: 20, borderTop: "1px solid #e6dfd8", paddingTop: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6c6a64", marginBottom: 16 }}>
        Full Practice Session Transcript
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(session.history || []).map((entry, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", color: "#6c6a64", letterSpacing: "0.08em", margin: 0 }}>
              Question {i + 1} · {entry.difficulty || "Medium"}
            </p>

            {/* AI Question */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ maxWidth: "85%", backgroundColor: "#181715", color: "#faf9f5", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", fontSize: 13, lineHeight: 1.6 }}>
                {entry.question}
              </div>
            </div>

            {/* User Answer */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "85%", backgroundColor: "#efe9de", color: "#141413", border: "1px solid #e6dfd8", borderRadius: "14px 4px 14px 14px", padding: "12px 16px", fontSize: 13, lineHeight: 1.6 }}>
                {entry.answer}
              </div>
            </div>

            {/* Evaluation */}
            {entry.evaluation && (
              <div style={{ backgroundColor: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: 8, padding: "12px 14px", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#6c6a64", textTransform: "uppercase", fontWeight: 600 }}>Evaluation</span>
                  <ScoreChip score={entry.evaluation.score} />
                </div>
                {entry.evaluation.suggestions && (
                  <p style={{ margin: 0, color: "#3d3d3a", fontStyle: "italic", lineHeight: 1.5 }}>
                    💡 {entry.evaluation.suggestions}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionCard({ session, index, onDelete }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sessionScores = (session.history || []).map(h => h?.evaluation?.score ?? 0);
  const sessionAvg = sessionScores.length ? (sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length).toFixed(1) : "—";

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this session record?")) return;
    setDeleting(true);
    try {
      await axios.delete(`${getApiBase()}/interview/session/${session.sessionId}`);
      onDelete(session.sessionId);
      toast.success("Session deleted.");
    } catch {
      toast.error("Failed to delete session.");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05 }}
      className="card-cream"
      style={{ padding: 24, position: "relative", opacity: deleting ? 0.5 : 1 }}
    >
      <div style={{ position: "absolute", top: 18, right: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <span className="badge-pill" style={{ fontSize: 11 }}>
          {session.currentDifficulty || "Medium"}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete session"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8b82", padding: 2 }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <h3 className="font-serif-display" style={{ fontSize: 20, margin: "0 0 4px", color: "#141413" }}>
        {session.role}
      </h3>
      <p style={{ fontSize: 12, color: "#6c6a64", fontFamily: "var(--font-jetbrains), monospace", margin: "0 0 16px" }}>
        {session.company} · {session.createdAt ? new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} · {(session.history || []).length} Qs
      </p>

      {/* Strengths & Weaknesses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5db872", marginBottom: 6 }}>Strengths</p>
          {(session.globalStrengths || []).length === 0 ? (
            <p style={{ fontSize: 12, color: "#8e8b82", fontStyle: "italic", margin: 0 }}>None logged</p>
          ) : (
            (session.globalStrengths || []).slice(0, 2).map((s, idx) => (
              <p key={idx} style={{ fontSize: 12, color: "#3d3d3a", margin: "0 0 3px" }}>+ {s}</p>
            ))
          )}
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#cc785c", marginBottom: 6 }}>Improvement</p>
          {(session.globalWeaknesses || []).length === 0 ? (
            <p style={{ fontSize: 12, color: "#8e8b82", fontStyle: "italic", margin: 0 }}>None logged</p>
          ) : (
            (session.globalWeaknesses || []).slice(0, 2).map((w, idx) => (
              <p key={idx} style={{ fontSize: 12, color: "#3d3d3a", margin: "0 0 3px" }}>— {w}</p>
            ))
          )}
        </div>
      </div>

      {/* Score bar & expand toggle */}
      <div style={{ borderTop: "1px solid #e6dfd8", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "#141413" }}>
          Average Score: <strong style={{ color: "#cc785c" }}>{sessionAvg}/10</strong>
        </span>
        <button
          onClick={() => setOpen(p => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#cc785c", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
        >
          <span>{open ? "Hide Transcript" : "View Full Transcript"}</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {open && <ChatTranscript session={session} />}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { userId, isLoaded } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const loadSessions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${getApiBase()}/interview/user/${userId}`);
        setSessions(Array.isArray(res.data) ? res.data : (res.data.sessions || []));
      } catch (e) {
        toast.error("Could not load practice history.");
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [userId, isLoaded]);

  const handleDeleteSession = (sId) => {
    setSessions(prev => prev.filter(s => s.sessionId !== sId));
  };

  const chartData = sessions.map((s, idx) => {
    const scores = (s.history || []).map(h => h?.evaluation?.score ?? 0);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    return { name: `S${idx + 1}`, score: parseFloat(avg), role: s.role };
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#faf9f5", color: "#141413" }}>
      <ShapeGrid />
      <TopNav />

      <main style={{ flex: 1, position: "relative", zIndex: 10, padding: "40px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="badge-coral" style={{ marginBottom: 12 }}>
            Candidate Profile & Analytics
          </div>
          <h1 className="font-serif-display" style={{ fontSize: 44, margin: "0 0 10px", color: "#141413" }}>
            Performance History & Progress
          </h1>
          <p style={{ fontSize: 16, color: "#6c6a64" }}>
            Track scores across all past mock rounds, review ideal answers, and monitor score trajectory over time.
          </p>
        </div>

        {/* Analytics Chart Box (Dark Navy Card) */}
        {chartData.length > 0 && (
          <div className="card-dark" style={{ padding: 32, marginBottom: 36 }}>
            <h3 className="font-serif-display" style={{ fontSize: 24, margin: "0 0 8px", color: "#faf9f5" }}>
              Interview Score Progression
            </h3>
            <p style={{ fontSize: 13, color: "#a09d96", marginBottom: 24 }}>Average evaluation score per session (out of 10)</p>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#8e8b82" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#8e8b82" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#181715", borderColor: "#252320", color: "#faf9f5", borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#cc785c" strokeWidth={3} dot={{ r: 5, fill: "#cc785c" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Session List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6c6a64" }}>
            Loading candidate records...
          </div>
        ) : sessions.length === 0 ? (
          <div className="card-cream" style={{ padding: 48, textAlign: "center" }}>
            <Activity size={36} color="#cc785c" style={{ margin: "0 auto 16px" }} />
            <h3 className="font-serif-display" style={{ fontSize: 24, margin: "0 0 8px" }}>No Completed Sessions Yet</h3>
            <p style={{ fontSize: 14, color: "#6c6a64" }}>
              Start your first practice session on the Interview Simulator tab to track your analytics.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 className="font-serif-display" style={{ fontSize: 28, margin: 0 }}>Completed Interview Rounds ({sessions.length})</h2>
            {sessions.map((session, index) => (
              <SessionCard
                key={session.sessionId || index}
                session={session}
                index={index}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
