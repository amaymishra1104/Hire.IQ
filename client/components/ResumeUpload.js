"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, X, AlertCircle, FileCode } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ResumeUpload({ value, onChange }) {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const extractPdfText = async (arrayBuffer) => {
    try {
      const textDecoder = new TextDecoder("utf-8");
      const rawText = textDecoder.decode(arrayBuffer);
      
      // Extract text content from PDF stream patterns like (Text) Tj or [(T1)(T2)]TJ or plain strings
      const textMatches = [];
      const tjRegex = /\(([^()]{2,})\)\s*T[jJ]/g;
      let match;
      while ((match = tjRegex.exec(rawText)) !== null) {
        if (match[1] && match[1].trim()) {
          // Clean PDF escaping like \( \) \\
          const cleaned = match[1].replace(/\\([()\\])/g, "$1").trim();
          if (cleaned.length > 1 && !/^\d+$/.test(cleaned)) {
            textMatches.push(cleaned);
          }
        }
      }

      if (textMatches.length > 5) {
        return textMatches.join(" ");
      }

      // Fallback: extract plain readable ASCII strings from raw stream
      const printableMatches = rawText.match(/[A-Za-z0-9\s,.:;\-\/()]{4,}/g) || [];
      const filtered = printableMatches
        .map(s => s.trim())
        .filter(s => s.length > 3 && !s.includes("endobj") && !s.includes("stream") && !s.includes("PDF") && !s.includes("Font"));
      
      return filtered.join(" ").slice(0, 4000);
    } catch (e) {
      console.warn("PDF extraction fallback:", e);
      return "";
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const extracted = await extractPdfText(arrayBuffer);
        
        if (extracted && extracted.trim().length > 30) {
          onChange(extracted);
          toast.success(`Loaded resume from ${file.name}`);
        } else {
          // Fallback to text reader if PDF text stream couldn't be parsed
          const reader = new FileReader();
          reader.onload = (e) => {
            const rawContent = e.target.result || "";
            const cleanText = rawContent.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
            onChange(cleanText || `Resume attached: ${file.name}`);
            toast.success(`Resume attached (${file.name})`);
          };
          reader.readAsText(file);
        }
      } else {
        // Plain text, markdown, doc, etc.
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result || "";
          onChange(text);
          toast.success(`Loaded resume from ${file.name}`);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      toast.error("Failed to process resume file.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    setFileName("");
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6c6a64", display: "block" }}>
          Resume / Profile Context
        </label>
        {value && (
          <span style={{ fontSize: 11, color: "#5db872", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
            <CheckCircle2 size={12} /> {value.trim().split(/\s+/).length} words extracted
          </span>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? "2px dashed #cc785c" : "1.5px dashed #e6dfd8",
          backgroundColor: isDragging ? "#efe9de" : "#faf9f5",
          borderRadius: 10,
          padding: "16px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#efe9de", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Upload size={18} color="#cc785c" />
        </div>

        <div style={{ textAlign: "left", flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#141413" }}>
            {fileName ? fileName : "Upload Resume (PDF, TXT, MD)"}
          </div>
          <div style={{ fontSize: 11, color: "#6c6a64" }}>
            {fileName ? "Click to change file or edit text below" : "Drag and drop your file here, or click to browse"}
          </div>
        </div>

        {fileName && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6c6a64", padding: 4 }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Textarea for previewing / editing extracted context */}
      <textarea
        className="input-editorial"
        rows={3}
        placeholder="Or paste your projects, tech stack, or resume text directly..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ resize: "vertical", fontSize: 13 }}
      />
    </div>
  );
}
