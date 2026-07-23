# Hire.IQ - AI Interview Copilot — by Amay Mishra

> **Live Demo → [Hire-IQ-opal.vercel.app](https://hire-iq-opal.vercel.app/)**
> **GitHub → [amaymishra1104/Hire.IQ](https://github.com/amaymishra1104/Hire.IQ.git)**



---

## What is this?

Hire.IQ is a **production-grade, agentic AI interview simulation engine** powered by Google Gemini. It runs a full multi-agent streaming pipeline to generate adaptive questions, evaluate your answers in real time, and build a neural profile of your strengths and weaknesses — across 5 progressively calibrated questions.

Users bring their own Gemini API key (BYOK), drag-and-drop their resume for personalized questions, and choose between voice answers, text answers, or a full coding round with an interactive code execution environment.

---

## Key Features

### 🎨 Premium Editorial Cream Design System
- Custom HSL typography and warm editorial palette (`#faf9f5` canvas, `#141413` text, `#cc785c` warm coral accents)
- Glassmorphic navigation and subtle background geometry
- Dynamic typewriter effect for streaming AI interviewer responses
- Smooth window scroll position resetting on view navigation

### 🧠 Multi-Agent AI Pipeline (SSE Streaming)
- **Agent 1 — Question Generator:** Streams role-specific opening questions (`/interview/stream-start`), tailored to candidate resume context
- **Agent 2 — Answer Evaluator:** Scores answers (0–10) with time & space complexity metrics, strengths, weaknesses, and ideal answers (`/interview/evaluate`)
- **Agent 3 — Follow-up Streamer:** Dynamically streams follow-up questions adapted to score and target difficulty (`/interview/stream-next`)

### 📄 Resume Drag & Drop Upload
- Drag-and-drop upload for **PDF, TXT, MD, DOC, DOCX** resumes directly on setup screen
- Client-side text stream parser extracts project history, tech stack, and experience without server storage
- Live word count counter and editable context preview box

### 💻 Code Editor with Live Execution ("Run Code")
- Embedded **Monaco Editor** (VS Code engine)
- Language picker supporting **JavaScript, Python, Java, C++, TypeScript, Go, Rust, C#**
- Integrated **Run Code** executor powered by Piston (free, instant execution, zero keys required)
- Dedicated terminal output drawer displaying execution output, runtime errors, and execution status

### 🎙️ 2-Way Voice & Live STT Mode
- Real-time Speech-to-Text (STT) powered by **Deepgram**
- Multi-engine Text-to-Speech (TTS) with support for **ElevenLabs** realistic voices or fallback Web Speech API
- Persona-aware voice toggling and mute options

### 🏢 Company & Persona Targeting
- Target company styles: **Google, Amazon, Stripe, Netflix, Meta** or Agnostic
- Interviewer tone: **Harsh Tech Lead, Friendly HR, Chaotic Startup Founder**
- Round categories: **Technical, HR & Culture, System Design, Coding Round**

### 📊 Score Progress & Career Mentor
- Detailed session scorecards with question-by-question scoring and breakdown
- Career Mentor page featuring weakness pattern analysis, weekly roadmaps, and recommended projects
- Profile page listing session history and user performance statistics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Styling | Custom Editorial Design System (Vanilla CSS) |
| Auth | Clerk (`@clerk/nextjs`) |
| AI Engine | Google Gemini (`gemini-3.6-flash`) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Code Execution | Piston API (`emkc.org`) |
| PDF & Resume | Client-side Text Stream Reader |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Animations | Framer Motion |
| Voice & STT | Deepgram STT + ElevenLabs / Web Speech API |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## Architecture

```
User Browser
  ↓  Clerk Auth Gate
  ↓  Gemini API Key Gate (BYOK)
  ↓  Resume Upload (Client-side PDF/TXT Parser)
Vercel → Next.js Frontend
  ↓  HTTP / SSE Streaming Requests
Render → Express Backend
  ├── POST /interview/stream-start → SSE Question Stream (Agent 1)
  ├── POST /interview/evaluate     → Neural Scoring (Agent 2)
  ├── POST /interview/stream-next  → SSE Adaptive Follow-up (Agent 3)
  └── GET  /interview/user/:id     → Fetch Session History
  ↓
MongoDB Atlas → Sessions Collection
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Main interview simulator — hero, setup, live interview room with code runner, scorecard |
| `/profile` | Full user practice history and session stats |
| `/mentor` | AI Career Coach — weakness breakdown, learning roadmaps, project ideas |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)
- A free [Clerk account](https://clerk.com)
- MongoDB Atlas connection string (or local `mongod`)

### Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/ai-interview-copilot
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
node index.js
# → Server running on port 5000
# → MongoDB Successfully Connected!
```

### Frontend
```bash
cd client
npm install
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the Next.js dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Clerk publishable key
CLERK_SECRET_KEY=                    # Clerk secret key
NEXT_PUBLIC_API_URL=                 # Backend URL (e.g. http://localhost:5000)
```

### Backend (`server/.env`)
```env
MONGO_URI=       # MongoDB Atlas connection string
PORT=5000
FRONTEND_URL=    # Allowed CORS frontend origin (e.g. http://localhost:3000)
```

---

## Deployment

| Service | Purpose | Cost |
|---|---|---|
| [Vercel](https://vercel.com) | Frontend hosting | Free |
| [Render](https://render.com) | Backend hosting | Free |
| [MongoDB Atlas](https://cloud.mongodb.com) | Cloud database | Free |
| [Clerk](https://clerk.com) | Authentication | Free (10k MAU) |

### Vercel Setup
1. Import repository → set **Root Directory** to `client`
2. Configure environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
3. Deploy!

### Render Setup
1. New Web Service → connect repo → set **Root Directory** to `server`
2. Build command: `npm install`
3. Start command: `node index.js`
4. Set environment variables (`MONGO_URI`, `PORT=5000`, `FRONTEND_URL`)

---

## License

MIT — built with ❤️ by [@amaymishra1104](https://github.com/amaymishra1104)
