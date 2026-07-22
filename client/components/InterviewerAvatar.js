"use client";
import { motion } from "framer-motion";

const PERSONAS = {
  "Harsh Tech Lead":        { initials: "TL", color: "#cc785c" },
  "Friendly Microsoft HR":  { initials: "HR", color: "#5db8a6" },
  "Chaotic Startup Founder":{ initials: "SF", color: "#e8a55a" },
};

const BAR_HEIGHTS = [6, 12, 8, 14, 7, 11, 5];

export default function InterviewerAvatar({ persona, isSpeaking, isListening, size = 44 }) {
  const p = PERSONAS[persona] || PERSONAS["Harsh Tech Lead"];

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Outer pulse ring when speaking */}
      {isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: -5, borderRadius: "50%",
            border: `1.5px solid ${p.color}`,
          }}
        />
      )}

      {/* Avatar circle */}
      <div style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: "#efe9de",
        border: `1.5px solid ${isSpeaking ? p.color : "#e6dfd8"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.3s",
      }}>
        {/* Initials — hidden when speaking */}
        {!isSpeaking && (
          <span style={{ fontSize: size * 0.29, fontWeight: 700, color: p.color, letterSpacing: 0 }}>
            {p.initials}
          </span>
        )}

        {/* Sound-wave bars when speaking */}
        {isSpeaking && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: "60%" }}>
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div key={i}
                style={{ width: 2.5, borderRadius: 2, backgroundColor: p.color }}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && !isSpeaking && (
        <motion.div
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: size * 0.28, height: size * 0.28,
            borderRadius: "50%", backgroundColor: "#5db872",
            border: `2px solid #faf9f5`,
          }}
        />
      )}
    </div>
  );
}
