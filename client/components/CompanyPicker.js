"use client";

import { useState, useRef, useEffect } from "react";
import { FEATURED, searchCompanies, getCompany } from "@/lib/companies";
import { Search, X, Check } from "lucide-react";

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#6c6a64",
  marginBottom: 10,
  display: "block",
};

export default function CompanyPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const selected = getCompany(value);
  const isFeatured = FEATURED.some(c => c.id === value);
  const results = searchCompanies(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (co) => {
    onChange(co.id);
    setQuery("");
    setOpen(false);
  };

  const clearCustom = () => {
    onChange("Agnostic");
    setQuery("");
  };

  return (
    <div>
      <span style={labelStyle}>Target Company</span>

      {/* Featured quick-pick grid */}
      <div className="company-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {FEATURED.map((co) => {
          const sel = value === co.id;
          return (
            <button
              key={co.id}
              type="button"
              onClick={() => { onChange(co.id); setQuery(""); }}
              title={co.tagline}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 6px",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all .15s ease",
                border: sel ? `1.5px solid #cc785c` : "1px solid #e6dfd8",
                background: sel ? "#efe9de" : "#faf9f5",
                boxShadow: sel ? "0 2px 8px rgba(204, 120, 92, 0.15)" : "none",
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: co.initials.length > 1 ? 10 : 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: sel ? "#cc785c" : "#f5f0e8",
                color: sel ? "#ffffff" : "#252523",
                transition: "all 0.15s ease",
              }}>
                {co.initials}
              </div>
              <span style={{ fontSize: 11, fontWeight: sel ? 600 : 500, color: sel ? "#141413" : "#3d3d3a" }}>
                {co.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div style={{ position: "relative" }} ref={dropRef}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#faf9f5",
          border: open ? "1px solid #cc785c" : "1px solid #e6dfd8",
          borderRadius: 8,
          padding: "9px 12px",
          boxShadow: open ? "0 0 0 3px rgba(204, 120, 92, 0.12)" : "none",
          transition: "all 0.15s ease",
        }}>
          <Search size={14} color="#8e8b82" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={isFeatured ? "Search any company (Google, Netflix, Stripe…)" : `Using: ${selected.name}`}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#141413",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
            }}
          />
          {!isFeatured && (
            <button onClick={clearCustom} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8b82", padding: 0, display: "flex" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#faf9f5",
            border: "1px solid #e6dfd8",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(20, 20, 19, 0.12)",
          }}>
            {results.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "#6c6a64" }}>
                No direct match — using "{query}" as custom company
                <button
                  onClick={() => { onChange(query); setQuery(""); setOpen(false); }}
                  style={{
                    marginLeft: 10,
                    fontSize: 12,
                    color: "#ffffff",
                    background: "#cc785c",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Use it →
                </button>
              </div>
            ) : (
              results.map(co => (
                <button
                  key={co.id}
                  onClick={() => pick(co)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: value === co.id ? "#efe9de" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    borderBottom: "1px solid #ebe6df",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#efe9de"}
                  onMouseLeave={e => e.currentTarget.style.background = value === co.id ? "#efe9de" : "transparent"}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#e8e0d2",
                    color: "#141413",
                    fontSize: co.initials.length > 1 ? 9 : 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {co.initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#141413" }}>{co.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#6c6a64" }}>{co.tagline}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
