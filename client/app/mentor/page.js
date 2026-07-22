"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowLeft, BrainCircuit, Target, TrendingUp, BookOpen,
  FolderGit2, Sparkles, Loader2, AlertCircle, Download,
  Brain, Zap, ChevronRight, CheckCircle2
} from "lucide-react";

import { getApiBase } from "@/lib/api";
import { loadGeminiKey } from "@/lib/brand";
import { toast } from "@/lib/toast";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import ShapeGrid from "@/components/ShapeGrid";

export default function MentorPage() {
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState("");
  const [targetRole, setTargetRole] = useState("Fullstack AI Engineer");

  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${getApiBase()}/mentor/${userId}`);
      setStats(res.data.stats);
      setRoadmap(res.data.roadmap);
      setHasData(res.data.hasData);
      if (res.data.stats?.roles?.[0]) setTargetRole(res.data.stats.roles[0]);
    } catch (e) {
      setError("Could not load mentor profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    fetchProfile();
  }, [userId, isLoaded]);

  const downloadRoadmap = async () => {
    if (!roadmap) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("Hire.IQ — Career Growth Roadmap", W / 2, y, { align: "center" }); y += 10;
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
    doc.text(`Target Role: ${roadmap.targetRole || targetRole} · Generated ${new Date().toLocaleDateString()}`, W / 2, y, { align: "center" }); y += 16;

    if (roadmap.weakness_analysis) {
      doc.setTextColor(0); doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Weakness Analysis", 14, y); y += 8;
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(40);
      const sumLines = doc.splitTextToSize(roadmap.weakness_analysis.summary || "", W - 28);
      doc.text(sumLines, 14, y); y += sumLines.length * 5 + 6;
      (roadmap.weakness_analysis.priority_areas || []).forEach(a => {
        doc.text(`• ${a}`, 18, y); y += 5;
      });
      y += 4;
    }

    if ((roadmap.learning_roadmap || []).length) {
      doc.setDrawColor(220); doc.line(14, y, W - 14, y); y += 8;
      doc.setTextColor(0); doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("4-Week Learning Roadmap", 14, y); y += 8;
      (roadmap.learning_roadmap || []).forEach(w => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(0);
        doc.text(`Week ${w.week}: ${w.focus}`, 14, y); y += 6;
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60);
        (w.topics || []).forEach(t => { doc.text(`  Topic: ${t}`, 16, y); y += 4; });
        (w.resources || []).forEach(r => { doc.text(`  Resource: ${r}`, 16, y); y += 4; });
        (w.goals || []).forEach(g => { doc.text(`  ✓ ${g}`, 16, y); y += 4; });
        y += 4;
      });
    }

    doc.save(`Hire-IQ-Roadmap-${Date.now()}.pdf`);
  };

  const generatePlan = async () => {
    const userApiKey = loadGeminiKey();
    if (!userApiKey) {
      toast.error("Please set your Gemini API Key in the top navigation bar first.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await axios.post(
        `${getApiBase()}/mentor/generate`,
        { clerkId: userId, userApiKey, targetRole: targetRole || undefined },
        { timeout: 90000 }
      );
      setStats(res.data.stats);
      setRoadmap(res.data.roadmap);
      setHasData(true);
      toast.success("AI Growth Roadmap generated!");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate roadmap.");
      toast.error("Roadmap generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#faf9f5", color: "#141413" }}>
      <ShapeGrid />
      <TopNav />

      <main style={{ flex: 1, position: "relative", zIndex: 10, padding: "40px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="badge-coral" style={{ marginBottom: 12 }}>
            AI Career Mentor & Growth Engine
          </div>
          <h1 className="font-serif-display" style={{ fontSize: 44, margin: "0 0 10px", color: "#141413" }}>
            Personalized Engineering Roadmap
          </h1>
          <p style={{ fontSize: 16, color: "#6c6a64", maxWidth: 640 }}>
            AI-generated weakness analysis, 4-week skill building milestones, and portfolio project suggestions based on your practice rounds.
          </p>
        </div>

        {/* Target Role & Controls Bar */}
        <div className="card-cream" style={{ padding: 24, marginBottom: 36, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block", marginBottom: 6 }}>
              Target Role
            </label>
            <input
              className="input-editorial"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: "100%" }}>
            <button
              className="btn-primary"
              onClick={generatePlan}
              disabled={generating}
              style={{ height: 42, padding: "0 24px" }}
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{generating ? "Synthesizing Roadmap..." : "Generate AI Growth Plan"}</span>
            </button>

            {roadmap && (
              <button
                className="btn-secondary"
                onClick={downloadRoadmap}
                style={{ height: 42, padding: "0 20px" }}
              >
                <Download size={15} color="#cc785c" />
                <span>Export PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6c6a64" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px", color: "#cc785c" }} />
            <p>Loading mentor profile...</p>
          </div>
        ) : !roadmap ? (
          <div className="card-cream" style={{ padding: 48, textAlign: "center" }}>
            <BrainCircuit size={40} color="#cc785c" style={{ margin: "0 auto 16px" }} />
            <h3 className="font-serif-display" style={{ fontSize: 24, margin: "0 0 8px" }}>No Roadmap Generated Yet</h3>
            <p style={{ fontSize: 14, color: "#6c6a64", maxWidth: 480, margin: "0 auto 24px" }}>
              Complete an interview practice session or click <strong>Generate AI Growth Plan</strong> above to analyze your performance and receive a custom 4-week study plan.
            </p>
            <button className="btn-primary" onClick={generatePlan} disabled={generating}>
              {generating ? "Generating..." : "Generate Roadmap Now"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {/* Weakness Analysis & Priorities */}
            {roadmap.weakness_analysis && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="card-cream" style={{ padding: 28 }}>
                  <h3 className="font-serif-display" style={{ fontSize: 22, margin: "0 0 12px", color: "#141413" }}>
                    Weakness & Gap Analysis
                  </h3>
                  <p style={{ fontSize: 14, color: "#3d3d3a", lineHeight: 1.6, margin: "0 0 16px" }}>
                    {roadmap.weakness_analysis.summary}
                  </p>
                </div>

                <div className="card-cream" style={{ padding: 28 }}>
                  <h3 className="font-serif-display" style={{ fontSize: 22, margin: "0 0 12px", color: "#cc785c" }}>
                    Priority Focus Areas
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(roadmap.weakness_analysis.priority_areas || []).map((area, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#141413" }}>
                        <CheckCircle2 size={16} color="#cc785c" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4-Week Timeline */}
            {(roadmap.learning_roadmap || []).length > 0 && (
              <div>
                <h2 className="font-serif-display" style={{ fontSize: 30, margin: "0 0 20px" }}>
                  4-Week Skill Acceleration Roadmap
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                  {(roadmap.learning_roadmap || []).map((w, idx) => (
                    <div key={idx} className="card-cream" style={{ padding: 24 }}>
                      <div className="badge-coral" style={{ marginBottom: 12, fontSize: 10 }}>
                        Week {w.week}
                      </div>
                      <h4 className="font-serif-display" style={{ fontSize: 18, margin: "0 0 12px", color: "#141413" }}>
                        {w.focus}
                      </h4>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#6c6a64", marginBottom: 4 }}>Topics</div>
                        {(w.topics || []).map((t, i) => (
                          <div key={i} style={{ fontSize: 13, color: "#3d3d3a", marginBottom: 2 }}>• {t}</div>
                        ))}
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#6c6a64", marginBottom: 4 }}>Milestone Goals</div>
                        {(w.goals || []).map((g, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#5db872", marginBottom: 2 }}>✓ {g}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Projects (Dark Navy Cards) */}
            {(roadmap.recommended_projects || []).length > 0 && (
              <div>
                <h2 className="font-serif-display" style={{ fontSize: 30, margin: "0 0 20px" }}>
                  Recommended Portfolio Projects
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {(roadmap.recommended_projects || []).map((p, idx) => (
                    <div key={idx} className="card-dark" style={{ padding: 28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "#cc785c", textTransform: "uppercase" }}>
                          {p.difficulty || "Medium"} · ~{p.estimated_weeks || 2} weeks
                        </span>
                        <FolderGit2 size={18} color="#faf9f5" />
                      </div>
                      <h3 className="font-serif-display" style={{ fontSize: 22, margin: "0 0 10px", color: "#faf9f5" }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 14, color: "#a09d96", lineHeight: 1.55, margin: 0 }}>
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
