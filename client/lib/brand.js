export const APP_NAME = "Hire.IQ";

const GEMINI_KEY = "Hire_gemini_key";
const LEGACY_GEMINI_KEY = "careerforge_gemini_key";

export function loadGeminiKey() {
  return "server-side-groq-key";
}

export function saveGeminiKey(key) {
  sessionStorage.setItem(GEMINI_KEY, key.trim());
  sessionStorage.removeItem(LEGACY_GEMINI_KEY);
}
