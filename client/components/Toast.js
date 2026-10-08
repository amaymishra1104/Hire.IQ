"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { subscribeToast } from "@/lib/toast";

const ICONS = {
  success: <CheckCircle2 size={16} color="#5db872" />,
  error:   <AlertCircle  size={16} color="#c64545" />,
  info:    <Info         size={16} color="#cc785c" />,
};

const BORDER = {
  success: "#5db872",
  error:   "#c64545",
  info:    "#cc785c",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast(t => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), t.duration);
    });
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{    opacity: 0, x: 40, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={{
              backgroundColor: "#181715",
              borderLeft: `4px solid ${BORDER[t.type]}`,
              borderTop: "1px solid #252320",
              borderRight: "1px solid #252320",
              borderBottom: "1px solid #252320",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              maxWidth: 340,
              fontSize: 13,
              color: "#faf9f5",
              boxShadow: "0 12px 32px rgba(20, 20, 19, 0.2)",
              pointerEvents: "all",
            }}>
            <span style={{ flexShrink: 0, display: "flex" }}>{ICONS[t.type]}</span>
            <span style={{ flex: 1, lineHeight: 1.4, fontFamily: "var(--font-sans)" }}>{t.msg}</span>
            <button onClick={() => dismiss(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#a09d96", padding: 0, flexShrink: 0 }}>
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
