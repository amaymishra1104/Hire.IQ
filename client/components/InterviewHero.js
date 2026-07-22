"use client";

import { motion } from "framer-motion";
import { Mic, Video, Sparkles, Users } from "lucide-react";
import { getCompany } from "@/lib/companies";

const PREVIEW_LINES = {
  Technical: "Thanks for joining us today. I'd like to start with something practical from your recent work…",
  "HR & Culture": "Great to meet you. Tell me about a time you had to navigate a difficult team situation.",
  "System Design": "Let's walk through a design problem — imagine you're launching a new service at scale.",
  "Coding Round": "I'll share a coding problem. Talk me through your approach as you work through it.",
};

const PERSONA_META = {
  "Harsh Tech Lead": { vibe: "Direct · Deep Probe", avatar: "TL" },
  "Friendly Microsoft HR": { vibe: "Warm · STAR Format", avatar: "HR" },
  "Chaotic Startup Founder": { vibe: "Fast · High Stakes", avatar: "SF" },
};

export default function InterviewHero({ company, persona, interviewType, role, candidateName }) {
  const co = getCompany(company);
  const meta = PERSONA_META[persona] || { vibe: "Professional", avatar: "AI" };
  const preview = PREVIEW_LINES[interviewType] || PREVIEW_LINES.Technical;

  return (
    <div style={{ paddingTop: 8 }}>
      {/* Live Badge Pill */}
      <div className="badge-pill" style={{ marginBottom: 20, backgroundColor: "#efe9de", borderColor: "#e6dfd8" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#5db872" }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3d3d3a" }}>
          Live Adaptive Simulation Engine
        </span>
      </div>

      {/* Serif Display Headline */}
      <h1 className="font-serif-display" style={{
        fontSize: "clamp(34px, 4.5vw, 54px)",
        lineHeight: 1.1,
        color: "#141413",
        margin: "0 0 16px",
      }}>
        Interview practice that<br />
        <span style={{ color: "#cc785c", fontStyle: "italic" }}>feels genuinely human.</span>
      </h1>

      <p style={{
        fontSize: 16,
        lineHeight: 1.6,
        color: "#3d3d3a",
        maxWidth: 480,
        margin: "0 0 28px",
      }}>
        Real adaptive conversation — not robotic flashcards. Question difficulty tunes dynamically based on every answer, matching top company styles with instant scored feedback.
      </p>

      {/* Feature tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {[
          { icon: Video, text: "Video-Call Vibe" },
          { icon: Mic, text: "Live Voice or Type" },
          { icon: Sparkles, text: "Resume Tailored" },
          { icon: Users, text: "Company Specific" },
        ].map(({ icon: Icon, text }) => (
          <span key={text} className="badge-pill" style={{ backgroundColor: "#faf9f5" }}>
            <Icon size={12} color="#cc785c" /> {text}
          </span>
        ))}
      </div>

      {/* Dark Navy Product Mockup Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: "#181715",
          border: "1px solid #252320",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: 520,
          boxShadow: "0 16px 40px rgba(20, 20, 19, 0.15)",
        }}
      >
        {/* Mock Window Header Bar */}
        <div style={{
          padding: "12px 18px",
          borderBottom: "1px solid #252320",
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          backgroundColor: "#1f1e1b",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: "#cc785c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              color: "#ffffff",
            }}>
              {meta.avatar}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#faf9f5" }}>{persona}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#a09d96", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {co.name} · {interviewType}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#c64545" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#e8a55a" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#5db872" }} />
          </div>
        </div>

        {/* Mock Conversation Body */}
        <div style={{ padding: "18px 18px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a09d96", margin: "0 0 12px" }}>
            {role ? `Interviewing for ${role}` : "Select a role to preview"}
          </p>
          <div style={{
            backgroundColor: "#252320",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "4px 14px 14px 14px",
            padding: "12px 16px",
            marginBottom: 12,
          }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#faf9f5" }}>
              {candidateName ? `Hi ${candidateName}, ` : ""}{preview}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              backgroundColor: "rgba(204, 120, 92, 0.15)",
              border: "1px solid rgba(204, 120, 92, 0.3)",
              borderRadius: "14px 4px 14px 14px",
              padding: "10px 14px",
              fontSize: 12,
              color: "#faf9f5",
              fontStyle: "italic",
            }}>
              Your answer appears here…
            </div>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 11, color: "#a09d96", fontFamily: "var(--font-jetbrains), monospace" }}>
            {meta.vibe} · Adaptive AI Evaluation Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
