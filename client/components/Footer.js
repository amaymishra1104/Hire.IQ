"use client";

import Link from "next/link";
import { RadialSpikeMark } from "./TopNav";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#181715",
      color: "#a09d96",
      padding: "64px 24px 48px",
      borderTop: "1px solid #252320",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <RadialSpikeMark size={20} color="#faf9f5" />
              <span style={{
                fontFamily: "var(--font-cormorant), Garamond, serif",
                fontSize: 22,
                fontWeight: 600,
                color: "#faf9f5",
                letterSpacing: "-0.02em",
              }}>
                Hire.<span style={{ color: "#cc785c" }}>IQ</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#a09d96", maxWidth: 280 }}>
              The warmest, most realistic adaptive AI technical & behavioral interview platform.
            </p>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#faf9f5", marginBottom: 16 }}>
              Platform
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <li><Link href="/" style={{ color: "#a09d96", textDecoration: "none" }}>Interview Simulator</Link></li>
              <li><Link href="/mentor" style={{ color: "#a09d96", textDecoration: "none" }}>AI Career Mentor</Link></li>
              <li><Link href="/profile" style={{ color: "#a09d96", textDecoration: "none" }}>Candidate Profile</Link></li>
              <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#cc785c", textDecoration: "none" }}>Get Gemini API Key →</a></li>
            </ul>
          </div>

          {/* Column 2: Supported Practice */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#faf9f5", marginBottom: 16 }}>
              Interviews
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <li>Technical Deep-Dive</li>
              <li>HR & STAR Culture Round</li>
              <li>System Design & Architecture</li>
              <li>Live Coding & Algorithms</li>
            </ul>
          </div>

          {/* Column 3: Design & Engine */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#faf9f5", marginBottom: 16 }}>
              Architecture
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
              <li>Editorial Warm Canvas UI</li>
              <li>Google Gemini AI Engine</li>
              <li>Monaco Code Workspace</li>
              <li>Deepgram Voice Transcription</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 32,
          borderTop: "1px solid #252320",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          fontSize: 13,
          color: "#8e8b82",
        }}>
          <div>© {new Date().getFullYear()} Hire.IQ. Editorial Design System following Anthropic Claude specifications.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
