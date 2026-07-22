"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Sparkles, Key, CheckCircle, BrainCircuit, User, MessageSquare, Volume2 } from "lucide-react";
import { loadGeminiKey } from "@/lib/brand";
import { loadElevenLabsKey } from "@/lib/tts";
import { useEffect, useState } from "react";

export function RadialSpikeMark({ size = 20, color = "#141413" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V22M2 12H22M4.92893 4.92893L19.0711 19.0711M4.92893 19.0711L19.0711 4.92893" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function TopNav({ onOpenKeyModal }) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasElevenKey, setHasElevenKey] = useState(false);

  useEffect(() => {
    setHasGeminiKey(!!loadGeminiKey());
    setHasElevenKey(!!loadElevenLabsKey());
  }, []);

  const navItems = [
    { label: "Interview Simulator", href: "/", icon: MessageSquare },
    { label: "AI Career Mentor", href: "/mentor", icon: BrainCircuit },
    { label: "Candidate Profile", href: "/profile", icon: User },
  ];

  return (
    <header style={{
      height: 64,
      backgroundColor: "#faf9f5",
      borderBottom: "1px solid #e6dfd8",
      position: "sticky",
      top: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
    }}>
      {/* Brand logo & wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <RadialSpikeMark size={22} color="#141413" />
          <span style={{
            fontFamily: "var(--font-cormorant), Garamond, serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#141413",
            letterSpacing: "-0.02em",
          }}>
            Hire.<span style={{ color: "#cc785c" }}>IQ</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  backgroundColor: isActive ? "#efe9de" : "transparent",
                  color: isActive ? "#141413" : "#6c6a64",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={15} color={isActive ? "#cc785c" : "#8e8b82"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right controls cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Gemini API Key indicator */}
        <button
          onClick={onOpenKeyModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 9999,
            backgroundColor: "#f5f0e8",
            border: `1px solid ${hasGeminiKey ? "#5db872" : "#cc785c"}`,
            fontSize: 12,
            fontWeight: 500,
            color: "#141413",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {hasGeminiKey ? (
            <>
              <CheckCircle size={13} color="#5db872" />
              <span>Gemini AI Ready</span>
            </>
          ) : (
            <>
              <Key size={13} color="#cc785c" />
              <span style={{ color: "#cc785c", fontWeight: 600 }}>Set Gemini Key</span>
            </>
          )}
        </button>

        {/* User Auth */}
        {isLoaded && (
          isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>
                Sign In
              </button>
            </SignInButton>
          )
        )}
      </div>
    </header>
  );
}
