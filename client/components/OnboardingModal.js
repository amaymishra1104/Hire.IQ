"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Key, Target } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Hire.IQ",
    body: "The most realistic, warm editorial AI technical interview simulator. Adaptive questions, live real-time evaluation, and honest scored feedback.",
  },
  {
    icon: Key,
    title: "You need one free Gemini key",
    body: "Hire.IQ runs on Google Gemini AI. Your key is 100% free (1,500 requests/day), takes 30 seconds to generate, and stays saved locally in your browser session.",
    cta: { label: "Get your free Gemini key →", href: "https://aistudio.google.com/app/apikey" },
  },
  {
    icon: Target,
    title: "Pick a target company & role",
    body: "Choose Google, Netflix, Amazon, or a custom target. Question difficulty tunes dynamically based on every answer you speak or type.",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("Hire_onboarded")) {
      setTimeout(() => setShow(true), 600);
    }
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem("Hire_onboarded", "1");
    setShow(false);
  };

  const CurrentIcon = STEPS[step].icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(20, 20, 19, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 8000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{
              backgroundColor: "#faf9f5",
              border: "1px solid #e6dfd8",
              borderRadius: 16,
              padding: "40px 36px 32px",
              maxWidth: 460,
              width: "100%",
              position: "relative",
              boxShadow: "0 24px 60px rgba(20, 20, 19, 0.2)",
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6c6a64",
                padding: 4,
              }}
            >
              <X size={18} />
            </button>

            {/* Progress indicators */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ backgroundColor: i <= step ? "#cc785c" : "#e6dfd8" }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 3, flex: 1, borderRadius: 99 }}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#efe9de",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <CurrentIcon size={24} color="#cc785c" />
                </div>

                <h2 className="font-serif-display" style={{ fontSize: 24, color: "#141413", margin: "0 0 12px" }}>
                  {STEPS[step].title}
                </h2>

                <p style={{ fontSize: 14, color: "#3d3d3a", lineHeight: 1.6, margin: 0 }}>
                  {STEPS[step].body}
                </p>

                {STEPS[step].cta && (
                  <a
                    href={STEPS[step].cta.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 14,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#cc785c",
                      textDecoration: "underline",
                    }}
                  >
                    {STEPS[step].cta.label}
                  </a>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Modal Footer Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
              <button
                onClick={dismiss}
                style={{
                  fontSize: 13,
                  color: "#6c6a64",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {step > 0 && (
                  <button
                    onClick={() => setStep(p => p - 1)}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => step < STEPS.length - 1 ? setStep(p => p + 1) : dismiss()}
                  className="btn-primary"
                  style={{ padding: "8px 20px", fontSize: 13 }}
                >
                  {step < STEPS.length - 1 ? "Next →" : "Let's begin →"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
