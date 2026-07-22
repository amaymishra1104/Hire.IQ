"use client";
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Code2, Play, Loader2, ChevronDown, Terminal, X, CheckCircle2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", pistonLang: "javascript", pistonVersion: "18.15.0" },
  { id: "python",     label: "Python",     pistonLang: "python",     pistonVersion: "3.10.0" },
  { id: "java",       label: "Java",       pistonLang: "java",       pistonVersion: "15.0.2" },
  { id: "cpp",        label: "C++",        pistonLang: "c++",        pistonVersion: "10.2.0" },
  { id: "typescript", label: "TypeScript", pistonLang: "typescript", pistonVersion: "5.0.3" },
  { id: "go",         label: "Go",         pistonLang: "go",         pistonVersion: "1.16.2" },
  { id: "rust",       label: "Rust",       pistonLang: "rust",       pistonVersion: "1.50.0" },
  { id: "csharp",     label: "C#",         pistonLang: "csharp",     pistonVersion: "6.12.0" },
];

const DEFAULT_CODE = {
  javascript: `// JavaScript solution\nfunction solution(nums) {\n  // Your code here\n  return nums;\n}\n\nconsole.log(solution([1, 2, 3, 4, 5]));`,
  python:     `# Python solution\ndef solution(nums):\n    # Your code here\n    return nums\n\nprint(solution([1, 2, 3, 4, 5]))`,
  java:       `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Interviewer!");\n    }\n}`,
  cpp:        `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Interviewer!" << endl;\n    return 0;\n}`,
  typescript: `function solution(nums: number[]): number[] {\n    return nums;\n}\n\nconsole.log(solution([1, 2, 3, 4, 5]));`,
  go:         `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Interviewer!")\n}`,
  rust:       `fn main() {\n    println!("Hello, Interviewer!");\n}`,
  csharp:     `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, Interviewer!");\n    }\n}`,
};

// ── Piston API executor ────────────────────────────────────────────────────────
async function runWithPiston(langMeta, code) {
  const ext = { javascript: "js", python: "py", java: "java", cpp: "cpp", typescript: "ts", go: "go", rust: "rs", csharp: "cs" };
  const filename = `solution.${ext[langMeta.id] || "txt"}`;

  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: langMeta.pistonLang,
      version: langMeta.pistonVersion,
      files: [{ name: filename, content: code }],
    }),
  });

  if (!res.ok) throw new Error(`Piston API error: ${res.status}`);
  const data = await res.json();
  const out = (data.run?.stdout || "") + (data.run?.stderr || "");
  return {
    output: out || "(no output)",
    exitCode: data.run?.code ?? 0,
    error: data.run?.stderr || null,
  };
}

export default function CodeEditor({ value, onChange, language, onLanguageChange }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null); // null = hidden, string = content
  const [outputError, setOutputError] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setOutputError(false);
    try {
      const result = await runWithPiston(currentLang, value);
      setOutput(result.output);
      setOutputError(!!result.error && result.exitCode !== 0);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      setOutputError(true);
    } finally {
      setRunning(false);
    }
  }, [currentLang, value]);

  const handleLangSelect = (lang) => {
    onLanguageChange(lang.id);
    // Set default starter code only if current value matches a known default
    const isDefaultCode = Object.values(DEFAULT_CODE).some(d => value.trim() === d.trim() || value.trim() === "// Write your solution here...\nfunction solution() {\n\n}");
    if (isDefaultCode && DEFAULT_CODE[lang.id]) {
      onChange(DEFAULT_CODE[lang.id]);
    }
    setLangOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f0e0d", borderRadius: 12, border: "1px solid #252320", overflow: "hidden" }}>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#181715", borderBottom: "1px solid #252320", gap: 10, flexShrink: 0 }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#c64545" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#e8a55a" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#5db872" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#a09d96", fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.08em", marginLeft: 6 }}>
            CODE_WORKSPACE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Language picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", backgroundColor: "#252320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#faf9f5", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace" }}
            >
              <Code2 size={12} color="#cc785c" />
              {currentLang.label}
              <ChevronDown size={11} color="#a09d96" />
            </button>
            {langOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, backgroundColor: "#1f1e1b", border: "1px solid #252320", borderRadius: 8, zIndex: 100, minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLangSelect(l)}
                    style={{ display: "block", width: "100%", padding: "8px 14px", textAlign: "left", background: language === l.id ? "#252320" : "transparent", color: language === l.id ? "#cc785c" : "#faf9f5", fontSize: 12, border: "none", cursor: "pointer", fontFamily: "var(--font-jetbrains), monospace" }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={running}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", backgroundColor: running ? "#252320" : "#cc785c", border: "none", borderRadius: 6, color: running ? "#a09d96" : "#ffffff", fontSize: 12, fontWeight: 600, cursor: running ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }} onClick={() => setLangOpen(false)}>
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={value}
          onChange={v => onChange(v || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            tabSize: 2,
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* ── Output Panel ──────────────────────────────────────────────── */}
      {output !== null && (
        <div style={{ borderTop: "1px solid #252320", backgroundColor: "#0f0e0d", flexShrink: 0, maxHeight: 200 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", backgroundColor: "#181715", borderBottom: "1px solid #252320" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Terminal size={12} color={outputError ? "#c64545" : "#5db872"} />
              <span style={{ fontSize: 11, fontWeight: 600, color: outputError ? "#c64545" : "#5db872", fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.06em" }}>
                {outputError ? "RUNTIME ERROR" : "OUTPUT"}
              </span>
            </div>
            <button onClick={() => setOutput(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a09d96", padding: 2 }}>
              <X size={13} />
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: "12px 14px",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: outputError ? "#f08080" : "#a8d5a2",
            overflowY: "auto",
            maxHeight: 150,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {output}
          </pre>
        </div>
      )}

      {/* ── Empty state hint ──────────────────────────────────────────── */}
      {output === null && !running && (
        <div style={{ padding: "8px 14px", backgroundColor: "#181715", borderTop: "1px solid #252320", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Terminal size={11} color="#a09d96" />
          <span style={{ fontSize: 11, color: "#a09d96", fontFamily: "var(--font-jetbrains), monospace" }}>
            Press <span style={{ color: "#cc785c" }}>Run Code</span> to execute — powered by Piston (free, no key needed)
          </span>
        </div>
      )}
    </div>
  );
}
